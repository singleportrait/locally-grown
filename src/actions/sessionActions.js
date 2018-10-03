import { SET_SECONDS_UNTIL_NEXT_PROGRAM, TOGGLE_MUTE } from './sessionTypes';
import { currentSecondsPastTheHour } from '../helpers';

const resetPrograms = () => dispatch => {
  console.log("It's time to reset the programs!");

  dispatch(setTimeUntilNextProgram(3600));

  // Reload available programs & program blocks to get the next program block
  // if there is one, or take you to another channel if not
  //
  // Also, reset session.currentHour!
}

export const initializeSession = () => dispatch => {
  /* Set how many seconds until it's time to load the next program */
  const secondsPastTheHour = currentSecondsPastTheHour();
  const oneHourInSeconds = 60 * 60;
  let secondsUntilNextProgram = oneHourInSeconds - secondsPastTheHour;

  if (secondsUntilNextProgram < 0) {
    secondsUntilNextProgram = 3600;
  }

  dispatch(setTimeUntilNextProgram(secondsUntilNextProgram));
}

const setTimeUntilNextProgram = (seconds) => dispatch => {
  setInterval(() => dispatch(resetPrograms()), 1000 * seconds);

  dispatch({
    type: SET_SECONDS_UNTIL_NEXT_PROGRAM,
    secondsUntilNextProgram: seconds
  })
}

export const toggleMute = (muted) => dispatch => {
  dispatch({
    type: TOGGLE_MUTE,
    muted: !muted,
    volume: !muted ? 0 : 1
  })
}
