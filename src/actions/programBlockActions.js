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

    // Set individual video lengths & full programming length
    videos.forEach((video, i) => {
      if ('length' in video.fields) {
        video.lengthInSeconds = convertTimeToSeconds(video.fields.length);
        video.startTime = programmingLength;

        let startsBeforeCurrentTime = false;
        if (programmingLength < secondsPastTheHour) {
          startsBeforeCurrentTime = true;
        }
        const newProgrammingLength = programmingLength + video.lengthInSeconds;

        if (programmingLength < secondsPastTheHour && newProgrammingLength > secondsPastTheHour) {
          videoToPlay = i;
        }

        programmingLength = newProgrammingLength;
        console.log(i);
      } else {
        // TODO: This is potentially where we could make requests to YT/Vimeo
        // to get the duration, but it's probably not worth the effort
        console.log("A video doesn't have a length!");
      }
    })

    const loadedProgramBlock = {
      sys: currentProgramBlock.sys,
      fields: currentProgramBlock.fields,
      videosInOrder: videos,
      currentVideo: videos[videoToPlay],
      videoPlayingIndex: videoToPlay,
      programmingLength: programmingLength
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
