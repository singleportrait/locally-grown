import store from '../store';
import { fetchFeaturedPrograms, setAvailablePrograms, setCurrentProgram, errorFetchingPrograms } from '../actions/programActions';

const addAvailableAndCurrentPrograms = (programs, dispatch) => {
  let availablePrograms = [];

  programs.items.map(program => program.fields.programBlocks.forEach(programBlock => {
    if (programBlock.fields.startTime === store.getState().session.currentHour) { // store.session.currentHour
      return availablePrograms.push(program);
    }
  }));

  console.log(`Found ${availablePrograms.length} available program(s) for the hour: `, availablePrograms);

  if (availablePrograms.length > 0) {
    dispatch(setAvailablePrograms(availablePrograms));

    const randomProgramIndex = Math.floor(Math.random()*availablePrograms.length);
    const currentProgram = availablePrograms[randomProgramIndex];

    console.log("I'm setting the current program!");
    dispatch(setCurrentProgram(randomProgramIndex, currentProgram));
  } else {
    const error = "No available programs!";
    dispatch(errorFetchingPrograms(error));
  }
}

export const initializePrograms = () => dispatch => {
  console.log("I'm in initializePrograms!");
  dispatch(fetchFeaturedPrograms()).then(programs => {
    console.log("I returned from dispatch inside fetchFeaturedPrograms!");
    addAvailableAndCurrentPrograms(programs, dispatch);
  });
}
