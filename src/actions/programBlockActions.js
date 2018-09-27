import { ADD_PROGRAM_BLOCK, SET_CURRENT_PROGRAM_BLOCK } from './programBlockTypes';
import store from '../store';
import client from '../services-contentful';

import { shuffleArray, convertTimeToSeconds, currentSecondsPastTheHour } from '../helpers';

const fetchProgramBlock = (programBlockId) => dispatch => {
  return new Promise(function(resolve, reject) {
    client.getEntry(programBlockId)
    .then(programBlock => {
      dispatch(initializeCurrentProgramBlockVideos(programBlock))
      .then(loadedProgramBlock => {
        dispatch(addProgramBlock(loadedProgramBlock));

        resolve(loadedProgramBlock);
      });
    });
  });
};

const setCurrentProgramBlock = (programBlock) => dispatch => {
  dispatch({
    type: SET_CURRENT_PROGRAM_BLOCK,
    currentProgramBlock: programBlock
  })
};

const addProgramBlock = (programBlock) => dispatch => {
  dispatch({
    type: ADD_PROGRAM_BLOCK,
    programBlock: programBlock
  })
}

const updateCurrentVideo = () => dispatch => {
  // Could this be used for setting AND updating?

  // const currentProgramBlock = state.currentProgramBlock;
  // const secondsPastTheHour = currentSecondsPastTheHour();
  // currentProgramBlock.videos.forEach((video, i) => {
  //   if (programmingLength < secondsPastTheHour && video.endTime > secondsPastTheHour) {
  //     videoToPlay = i;
  //     timestampForCurrentVideo = secondsPastTheHour - programmingLength;
  //   }
  // });

  // dispatch({
  //   type: UPDATE_CURRENT_VIDEO,
  //   currentVideo: currentProgramBlock.videos[i],
  //   videoPlayingIndex: i,
  //   timestamp: timestamp
  // })
}

const initializeCurrentProgramBlockVideos = (currentProgramBlock) => dispatch => {
  return new Promise(function(resolve, reject) {
    // Set videos
    let videos = currentProgramBlock.fields.videos;
    const showRandomVideos = currentProgramBlock.fields.isRandom;

    if (showRandomVideos) {
      console.log("This program block is random!");
      videos = shuffleArray(videos);
    }

    let programmingLength = 0;
    const secondsPastTheHour = currentSecondsPastTheHour();
    let videoToPlay = 0;
    let timestampForCurrentVideo = 0;

    // Set individual video lengths & full programming length
    videos.forEach((video, i) => {
      if ('length' in video.fields) {
        const videoLengthInSeconds = convertTimeToSeconds(video.fields.length);
        video.lengthInSeconds = videoLengthInSeconds
        video.startTime = programmingLength;

        // Need to move some of this out of here so we can poll at later
        // points to determine whether it's time to swap in a new video/timestamp
        const newProgrammingLength = programmingLength + videoLengthInSeconds;
        video.endTime = programmingLength + videoLengthInSeconds;

        if (programmingLength < secondsPastTheHour && video.endTime > secondsPastTheHour) {
          videoToPlay = i;

          // TODO: This should be able to dispatch independently to the
          // loaded program block, so that when you come back to the channel
          // only this timestamp changes (and the current video, if needed)
          // & udpates where the video would be playing had it moved
          // forward in time after you switched channels
          timestampForCurrentVideo = secondsPastTheHour - programmingLength;
        }

        programmingLength = video.endTime;
      } else {
        // TODO: This is potentially where we could make requests to YT/Vimeo
        // to get the duration, but it's probably not worth the effort
        console.log("A video doesn't have a length!");
      }
    })

    if (programmingLength < 3600) {
      console.log("This programming isn't enough to fill the hour!");
    }

    const loadedProgramBlock = {
      sys: currentProgramBlock.sys,
      fields: currentProgramBlock.fields,
      videosInOrder: videos,
      currentVideo: videos[videoToPlay],
      videoPlayingIndex: videoToPlay,
      programmingLength: programmingLength,
      timestampForCurrentVideo: timestampForCurrentVideo
    }

    resolve(loadedProgramBlock);
  })
}

export const getCurrentProgramBlock = (programBlockId) => dispatch => {
  const savedProgramBlock = store.getState().programBlocks.loadedProgramBlocks.find(programBlock => {
    return programBlock.sys.id === programBlockId;
  })

  if (savedProgramBlock) {
    console.log("Using a saved program block");
    dispatch(setCurrentProgramBlock(savedProgramBlock));
  } else {
    console.log("Fetching a new program block");
    dispatch(fetchProgramBlock(programBlockId))
    .then(programBlock => {
      dispatch(setCurrentProgramBlock(programBlock));
    });
  }
}
