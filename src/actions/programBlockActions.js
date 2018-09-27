import { ADD_PROGRAM_BLOCK, SET_CURRENT_PROGRAM_BLOCK } from './programBlockTypes';
import store from '../store';
import client from '../services-contentful';

import { shuffleArray } from '../helpers';

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
    // Run set videos code
    let videos = currentProgramBlock.fields.videos;
    const showRandomVideos = currentProgramBlock.fields.isRandom;

    if (showRandomVideos) {
      console.log("This program block is random!");
      videos = shuffleArray(videos);
    }

    // TODO: Calculate programming length of videos
    // Iterate through all videos and add together their minutes and seconds
    // Add `startTime` to each video (along with its sys and fields)
    //
    // TODO: Calculate which video to play based on the program order & lengths

    const videoToPlay = 0;

    const loadedProgramBlock = {
      sys: currentProgramBlock.sys,
      fields: currentProgramBlock.fields,
      videosInOrder: videos,
      currentVideo: videos[videoToPlay],
      videoPlayingIndex: videoToPlay,
      programmingLength: null
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
