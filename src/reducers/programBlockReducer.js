import { ADD_PROGRAM_BLOCK, SET_CURRENT_PROGRAM_BLOCK, UPDATE_PROGRAM_BLOCK, SET_CURRENT_VIDEO } from '../actions/programBlockTypes';

const initialState = {
  isLoaded: false,
  loadedProgramBlocks: [],
  currentProgramBlock: null,
}

export default function(state = initialState, action) {
  switch (action.type) {
    case ADD_PROGRAM_BLOCK:
      return Object.assign({}, state, {
        loadedProgramBlocks: [
          ...state.loadedProgramBlocks, action.programBlock
        ]
      })
    case UPDATE_PROGRAM_BLOCK:
      const updatedPrograms = state.loadedProgramBlocks.map(programBlock => {
        if (programBlock.id === action.id) {
          return {...programBlock, ...action.programBlock};
        }
        return programBlock;
      })
      return updatedPrograms;
    case SET_CURRENT_PROGRAM_BLOCK:
      return {
        ...state,
        isLoaded: true,
        currentProgramBlock: action.currentProgramBlock
      }
    case SET_CURRENT_VIDEO:
      return {
        ...state,
        currentProgramBlock: {
          ...state.currentProgramBlock,
          currentVideo: action.video,
          videoPlayingIndex: action.index,
          timestampToStartVideo: action.timestamp
        }
      }
    default:
      return state;
  }
}
