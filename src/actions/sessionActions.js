import { SET_SECONDS_UNTIL_NEXT_PROGRAM, SET_LOW_BATTERY_MODE } from './sessionTypes';
import { currentSecondsPastTheHour } from '../helpers';
import store from '../store';
import consoleLog from '../consoleLog';

const resetPrograms = () => dispatch => {
  consoleLog("It's time to reset the programs!");

  const newHour = new Date().getHours();

  // For debugging issues with hour starts:
  // const newHour = 11;

  dispatch(setTimeUntilNextProgram(3600, newHour));

  // This will currently allow for the hour to change to have nothing playing
  // in the new hour, but I'm fine with that.
  // TODO: Reload availablePrograms() somehow to properly
  // set previous & next buttons
}

const setTimeUntilNextProgram = (seconds, currentHour) => dispatch => {
  clearInterval(store.getState().session.intervalID);

  const newIntervalID = setInterval(() => dispatch(resetPrograms()), 1000 * seconds);

  dispatch({
    type: SET_SECONDS_UNTIL_NEXT_PROGRAM,
    secondsUntilNextProgram: seconds,
    intervalID: newIntervalID,
    currentHour: currentHour
  })
}

export const initializeSession = () => dispatch => {
  /* Set how many seconds until it's time to load the next program */
  const secondsPastTheHour = currentSecondsPastTheHour();
  const oneHourInSeconds = 60 * 60;
  let secondsUntilNextProgram = oneHourInSeconds - secondsPastTheHour;

  if (secondsUntilNextProgram < 0) {
    secondsUntilNextProgram = 3600;
  }

  // For debugging issues with hour starts:
  // secondsUntilNextProgram = 30;

  const hour = new Date().getHours();
  dispatch(setTimeUntilNextProgram(secondsUntilNextProgram, hour));
}

export const setLowBatteryMode = (lowBatteryMode) => dispatch => {
  dispatch({
    type: SET_LOW_BATTERY_MODE,
    lowBatteryMode: lowBatteryMode
  })
}
