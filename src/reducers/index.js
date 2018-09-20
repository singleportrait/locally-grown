import { combineReducers } from 'redux';
import programReducer from './programReducer';

const initialState = {
  session: {
    arrivedAt: null,
    currentHour: null
  },
  programs: {
    isFetching: false,
    isLoaded: false,
    featuredPrograms: [],
    availablePrograms: [],
    currentProgramIndex: null,
    currentProgram: {
      isFetching: false,
      id: null,
      fields: {},
      programBlocks: [],
      currentProgramBlock: {
        isRandom: null,
        videos: [],
        currentVideo: {},
        currentVideoIndex: null
      },
    }
  },
  channels: {
  },
  users: {
  }
}

console.log(initialState);

export default combineReducers({
  programs: programReducer
});
