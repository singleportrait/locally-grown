import { FETCH_FEATURED_PROGRAMS, SET_AVAILABLE_PROGRAMS, SET_CURRENT_PROGRAM, ERROR_FETCHING_PROGRAMS } from './programTypes';
// import thunk from 'redux-thunk';
import client from '../services-contentful';

// Official React suggestions:
// requestFeaturedPrograms
// receiveFeaturedPrograms

export const fetchFeaturedPrograms = () => dispatch => {
  return new Promise(function(resolve, reject) {
    client.getEntries({
      content_type: 'program',
      'fields.featured': true
    }).then(programs => {
      dispatch({
        type: FETCH_FEATURED_PROGRAMS,
        featuredPrograms: programs,
      });

      resolve(programs)
    }, (error) => {
      dispatch(errorFetchingPrograms(error));
      console.log("Errored");
      throw error;
    });
  });
};

export const setAvailablePrograms = (programs) => dispatch => {
  dispatch({
    type: SET_AVAILABLE_PROGRAMS,
    availablePrograms: programs
  });
}

export const setCurrentProgram = (randomProgramIndex, currentProgram) => dispatch => {
  dispatch({
    type: SET_CURRENT_PROGRAM,
    currentProgramIndex: randomProgramIndex,
    currentProgram: {
      sys: currentProgram.sys,
      fields: currentProgram.fields
    }
  });
}

export const errorFetchingPrograms = (error) => dispatch => {
  dispatch({
    type: ERROR_FETCHING_PROGRAMS,
    payload: error
  })
}

export const nextProgram = () => dispatch => {
  // dispatch({
  //   type: 'NEXT_PROGRAM',
  //   currentProgramIndex: xx,
  //   currentProgram: xx
  // })
}
