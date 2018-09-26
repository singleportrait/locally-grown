import { combineReducers } from 'redux';
import programReducer from './programReducer';
import programBlockReducer from './programBlockReducer';
import sessionReducer from './sessionReducer';

const initialState = {
  session: {
    arrivedAt: null,
    currentHour: null
  },
  programs: {
    isLoaded: false,
    error: false,
    featuredPrograms: [
      {
        // CAN WE AVOID HAVING A WHOLE SEPARATE THING 4 AVAILABLE PROGRAMS?
        // isCurrentlyAvailable: null,
        sys: {},
        fields: {}
      },
      {
        // isCurrentlyAvailable: null,
        sys: {},
        fields: {}
      },
    ],
    availablePrograms: [],
    currentProgramIndex: null,
    currentProgram: {
      sys: {},
      fields: {},
      programBlocks: [],
      currentProgramBlock: {
        isLoaded: true,
        isRandom: null,
        videos: [
          { sys: {}, fields: {} }
        ],
        currentVideo: {},
        currentVideoIndex: null
      },
    }
  },
  // TRYING TO REDUCE NESTING
  // currentProgram: {
  //   sys: {
  //     id: 1
  //   },
  //   fields: {
  //     programBlocks: [] // Comes with the response
  //   },
  // },
  // currentProgramBlock: {
  //   id: 1,
  //   isLoaded: false,
  //   videos: [
  //     { sys: {}, fields: {} },
  //     { sys: {}, fields: {} }
  //   ],
  //   currentVideo: {
  //     sys: {}, fields: {}
  //   },
  //   currentVideoIndex: null
  // }
  channels: {
  },
  users: {
  }
}

//console.log(initialState);

export default combineReducers({
  programs: programReducer,
  programBlocks: programBlockReducer,
  session: sessionReducer
});
