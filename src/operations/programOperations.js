import { fetchFeaturedPrograms, setAvailablePrograms, setCurrentProgram, errorFetchingPrograms } from '../actions/programActions';
import store from '../store';

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

export const goToNextProgram = () => dispatch => {
  const programs = store.getState().programs;
  const availablePrograms = programs.availablePrograms;
  const currentProgramIndex = programs.currentProgramIndex;
  let newProgramIndex = currentProgramIndex + 1;

  if (newProgramIndex > availablePrograms.length - 1) {
    newProgramIndex = 0;
  }

  dispatch(setCurrentProgram(newProgramIndex, availablePrograms[newProgramIndex]));
}

export const goToPreviousProgram = () => dispatch => {
  // Implement previous program switch
}

export const initializePrograms = () => dispatch => {
  console.log("I'm initializing the programs...");
  dispatch(fetchFeaturedPrograms()).then(programs => {
    addAvailableAndCurrentPrograms(programs, dispatch);
  });
}
