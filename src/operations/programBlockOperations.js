import { setCurrentProgramBlock, addProgramBlock, setCurrentVideo } from '../actions/programBlockActions';
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

const initializeCurrentProgramBlockVideos = (currentProgramBlock) => dispatch => {
  console.log("Initializing program block", currentProgramBlock.fields.title);
  return new Promise(function(resolve, reject) {
    let videos = currentProgramBlock.fields.videos;

    if (currentProgramBlock.fields.isRandom) {
      console.log("This program block is random.");
      videos = shuffleArray(videos);
    }

    let programmingLength = 0;
    const secondsPastTheHour = currentSecondsPastTheHour();
    let videoToPlayIndex = 0;
    let timestampToStartVideo = 0;

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
          videoToPlayIndex = i;

          // TODO: This should be able to dispatch independently to the
          // loaded program block, so that when you come back to the channel
          // only this timestamp changes (and the current video, if needed)
          // & udpates where the video would be playing had it moved
          // forward in time after you switched channels
          timestampToStartVideo = secondsPastTheHour - programmingLength;
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
    if (programmingLength < secondsPastTheHour) {
      console.log("The programming isn't even enough to get to this time in the hour!");
    }

    const loadedProgramBlock = {
      sys: currentProgramBlock.sys,
      fields: currentProgramBlock.fields,
      currentVideo: videos[videoToPlayIndex],
      videoPlayingIndex: videoToPlayIndex,
      programmingLength: programmingLength,
      timestampToStartVideo: timestampToStartVideo
    }

    resolve(loadedProgramBlock);
  })
}

const setupCurrentVideoAfterInitialLoad = () => dispatch => {
  // Could this be used for setting AND updating?

  console.log("Updating current video info after switching channels; setupCurrentVideoAfterInitialLoad()");
  const currentProgramBlock = store.getState().programBlocks.currentProgramBlock;
  const secondsPastTheHour = currentSecondsPastTheHour();
  const videos = currentProgramBlock.fields.videos;

  let videoToPlayIndex = 0;
  let timestampToStartVideo = 0;
  videos.forEach((video, i) => {
    if ('length' in video.fields) {
      if (video.startTime < secondsPastTheHour && video.endTime > secondsPastTheHour) {
        videoToPlayIndex = i;
        timestampToStartVideo = secondsPastTheHour - video.startTime;
        console.log("Found a video to play at timestamp...", timestampToStartVideo);
      }
    }
  });

  if (currentProgramBlock.programmingLength < secondsPastTheHour) {
    console.log("The programming isn't even enough to get to this time in the hour!");
  }

  dispatch(setCurrentVideo(videos[videoToPlayIndex], videoToPlayIndex, timestampToStartVideo));
}

export const updateCurrentVideo = () => dispatch => {
  const currentProgramBlock = store.getState().programBlocks.currentProgramBlock;
  const videoPlayingIndex = currentProgramBlock.videoPlayingIndex;

  let newVideoIndex = videoPlayingIndex + 1;
  if (newVideoIndex >= currentProgramBlock.fields.videos.length) {
    console.log("This was the last video! Going back to the beginning");
    newVideoIndex = 0;
  }

  const newCurrentVideo = currentProgramBlock.fields.videos[newVideoIndex];
  const newTimestamp = 0;

  dispatch(setCurrentVideo(newCurrentVideo, newVideoIndex, newTimestamp));
}

export const getCurrentProgramBlock = (programBlockId) => dispatch => {
  const savedProgramBlock = store.getState().programBlocks.loadedProgramBlocks.find(programBlock => {
    return programBlock.sys.id === programBlockId;
  })

  if (savedProgramBlock) {
    console.log("- Using a saved program block");
    dispatch(setCurrentProgramBlock(savedProgramBlock));
    // Then, probably update to the latest/correct video?
    dispatch(setupCurrentVideoAfterInitialLoad()); // + need to set correct index + timestamp video
  } else {
    console.log("- Don't have this program block saved yet; fetching it now.");
    dispatch(fetchProgramBlock(programBlockId))
    .then(programBlock => {
      dispatch(setCurrentProgramBlock(programBlock));
    });
  }
}
