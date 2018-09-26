import { FETCH_FEATURED_PROGRAMS, SET_AVAILABLE_PROGRAMS, SET_CURRENT_PROGRAM, ERROR_FETCHING_PROGRAMS } from '../actions/programTypes';

const initialState = {
  isLoaded: false,
  featuredPrograms: [],
  availablePrograms: [],
  currentProgram: null,
  currentProgramIndex: null,
  error: null,
}

const fakeProgramData = {
  isLoaded: true,
  currentHour: 10, // Move up outside of programs store
  featuredPrograms: [
    {
      sys: {
        id: 1,
      },
      fields: {
        title: "Jenn's Channel Default",
      }
    },
    {
      sys: {
        id: 2,
      },
      fields: {
        title: "K-SBI Channel Default",
      }
    }
  ],
  availablePrograms: [
    {
      sys: {
        id: 1,
      },
      fields: {
        title: "Jenn's Channel Default",
      }
    },
    {
      sys: {
        id: 2,
      },
      fields: {
        title: "K-SBI Channel Default",
      }
    }
  ],
  currentProgramIndex: 0,
  currentProgram: {
    sys: {
      id: 1,
    },
    fields: {
      title: "Jenn's Channel Default",
      programBlocks: [
        {
          sys: {
            id: 1
          },
          fields: {
            startTime: 0,
            title: "Midnight Hour"
          }
        },
        {
          sys: {
            id: 2
          },
          fields: {
            startTime: 1,
            title: "ONE A.M."
          }
        },
        {
          sys: {
            id: 3
          },
          fields: {
            startTime: 10,
            title: "Life Philosophies"
          }
        }
      ],
    },
    currentProgramBlock: {
      isLoaded: true,
      isRandom: true,
      videos: [
        {
          sys: {
            id: 10
          },
          fields: {
            title: "Do Easy",
            url: "https://www.youtube.com/watch?v=j8zDXBSfAAk"
          }
        },
        {
          sys: {
            id: 11
          },
          fields: {
            title: "Another Video",
            url: "https://www.youtube.com/watch?v=j8zDXBSfAAk"
          }
        }
      ],
      currentVideo: {
        sys: {
          id: 10
        },
        fields: {
          title: "Do Easy",
          url: "https://www.youtube.com/watch?v=j8zDXBSfAAk"
        }
      },
      currentVideoIndex: 0,
      fields: {
        title: "Life Philosophies",
        startTime: 10
      }
    }
  },
  error: null
}

export default function(state = initialState, action) {
  switch (action.type) {
    case FETCH_FEATURED_PROGRAMS:
      return {
        ...state,
        featuredPrograms: action.featuredPrograms,
        isLoaded: true
      }
    case SET_AVAILABLE_PROGRAMS:
      return {
        ...state,
        availablePrograms: action.availablePrograms,
      }
    case SET_CURRENT_PROGRAM:
      return {
        ...state,
        currentProgramIndex: action.currentProgramIndex,
        currentProgram: action.currentProgram,
      }
    case ERROR_FETCHING_PROGRAMS:
      return {
        ...state,
        error: action.payload
      }
    default:
      return state;
  }
};
