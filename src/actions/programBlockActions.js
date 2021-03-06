import { ADD_PROGRAM_BLOCK, SET_CURRENT_PROGRAM_BLOCK, SET_CURRENT_VIDEO, PROGRAM_BLOCK_ERROR } from './programBlockTypes';

export const addProgramBlock = (programBlock) => dispatch => {
  dispatch({
    type: ADD_PROGRAM_BLOCK,
    programBlock: programBlock
  })
}

export const setCurrentProgramBlock = (programBlock) => dispatch => {
  dispatch({
    type: SET_CURRENT_PROGRAM_BLOCK,
    currentProgramBlock: programBlock
  })
};

export const setCurrentVideo = (currentVideo, index, timestamp) => dispatch => {
  dispatch({
    type: SET_CURRENT_VIDEO,
    video: currentVideo,
    index: index,
    timestamp: timestamp
  })
}

export const programBlockError = (programBlock, error) => dispatch => {
  dispatch({
    type: PROGRAM_BLOCK_ERROR,
    currentProgramBlock: programBlock,
    error: error
  })
}
