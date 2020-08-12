import { SET_SECONDS_UNTIL_NEXT_PROGRAM, SET_LOW_BATTERY_MODE } from './sessionTypes';
import { calculateSecondsUntilNextProgram } from '../helpers/utils';
import { findAndSetFeaturedChannels } from '../operations/channelOperations';
import store from '../store';
import consoleLog from '../helpers/consoleLog';

// Only enable debug mode in development
const debugMode = false && process.env.NODE_ENV === `development`;

const resetPrograms = () => dispatch => {
  consoleLog("It's time to reset the programs!");

  // For debugging issues with hour starts:
  const newHour = debugMode ? 19 : new Date().getHours();

  // Over time, the switching over to a new program doesn't happen exactly on
  // the hour anymore. So, we want to calculate the actual seconds until the
  // next hour is going to happen, like we do when the site loads
  const secondsUntilNextProgram = calculateSecondsUntilNextProgram();

  dispatch(setTimeUntilNextProgram(secondsUntilNextProgram, newHour));


  // This updates all the featured channels and program blocks when it's a new hour
  // This ensures the program blocks going forward are correct, and also
  // ensures that if a program ends at midnight it'll get removed from the TV guide
  findAndSetFeaturedChannels(store.getState().channels.allChannels, dispatch);
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

/* Set how many seconds until it's time to load the next program */
export const initializeSession = () => dispatch => {
  // For debugging issues with hour starts:
  const secondsUntilNextProgram = debugMode ? 20 : calculateSecondsUntilNextProgram();
  const hour = debugMode ? 18 : new Date().getHours();

  consoleLog("- Seconds until the next program are: ", secondsUntilNextProgram);

  dispatch(setTimeUntilNextProgram(secondsUntilNextProgram, hour));
}

export const setLowBatteryMode = (lowBatteryMode) => dispatch => {
  dispatch({
    type: SET_LOW_BATTERY_MODE,
    lowBatteryMode: lowBatteryMode
  })
}
