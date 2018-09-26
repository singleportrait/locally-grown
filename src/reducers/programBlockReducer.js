import { ADD_PROGRAM_BLOCK, SET_CURRENT_PROGRAM_BLOCK, UPDATE_PROGRAM_BLOCK } from '../actions/programBlockTypes';

const initialState = {
  loadedProgramBlocks: [],
  currentProgramBlock: null,
}

export default function(state = initialState, action) {
  switch (action.type) {
    case ADD_PROGRAM_BLOCK:
      // return {
      //   ...state,
      //   loadedProgramBlocks: [...state.loadedProgramBlocks, action.programBlock]
      // }
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
        currentProgramBlock: action.currentProgramBlock
      }
    default:
      return state;
  }
}
