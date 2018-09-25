import { FETCH_FEATURED_PROGRAMS, SET_AVAILABLE_PROGRAMS, SET_CURRENT_PROGRAM, ERROR_FETCHING_PROGRAMS } from './programTypes';
// import thunk from 'redux-thunk';
import client from '../services-contentful';

// Official React suggestions:
// requestFeaturedPrograms
// receiveFeaturedPrograms

export const fetchFeaturedPrograms = () => dispatch => {
  console.log('Called');
  client.getEntries({
    content_type: 'program',
    'fields.featured': true
  }).then(programs => {
    dispatch({
      type: FETCH_FEATURED_PROGRAMS,
      payload: programs,
      receivedAt: Date.now()
    });
    // This should be a then() instead, below
    setCurrentProgram(programs);
  }, (error) => {
    dispatch({
      type: ERROR_FETCHING_PROGRAMS,
      payload: error
    });
    console.log("Errored");
    throw error;
  });
};

const setCurrentProgram = (programs) => dispatch => {
  let availablePrograms = [];

  programs.map(program => program.fields.programBlocks.forEach(programBlock => {
    if (programBlock.fields.startTime === this.state.currentHour) { // store.session.currentHour
      return availablePrograms.push(program);
    }
  }));

  console.log("Featured Programs with an active Program Block for this hour:", availablePrograms);

  dispatch({
    type: SET_AVAILABLE_PROGRAMS,
    availablePrograms: availablePrograms
  });

  const randomProgramIndex = Math.floor(Math.random()*availablePrograms.length);
  const currentProgram = availablePrograms[randomProgramIndex];

  dispatch({
    type: SET_CURRENT_PROGRAM,
    currentProgramIndex: randomProgramIndex,
    // This nested way doesn't actually work, but something will!
    currentProgram: {
      isFetching: false,
      id: currentProgram.sys.id,
      fields: currentProgram.fields
    }
  });
}

export const fetchSelectedProgram = () => dispatch => {
  // Need to figure out how to return this as a promise, so I can
  // only setCurrentProgram() after the first programs have been loaded.
  // Supposedly thunk with `return dispatch()` (as in the method above)
  // allow it to return a promise, but the `then()` is erroring out.
  dispatch(fetchFeaturedPrograms());
  // dispatch(fetchFeaturedPrograms()).then(() => {
  //   setCurrentProgram(programs)
  // });
}

export const nextProgram = () => dispatch => {
  // dispatch({
  //   type: 'NEXT_PROGRAM',
  //   currentProgramIndex: xx,
  //   currentProgram: xx
  // })
}
