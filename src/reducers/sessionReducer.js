import { SET_SECONDS_UNTIL_NEXT_PROGRAM, SET_LOW_BATTERY_MODE } from '../actions/sessionTypes';

const initialState = {
  currentHour: new Date().getHours(),
  secondsUntilNextProgram: null,
  lowBatteryMode: undefined
}

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_SECONDS_UNTIL_NEXT_PROGRAM:
      return {
        ...state,
        secondsUntilNextProgram: action.secondsUntilNextProgram,
        intervalID: action.intervalID,
        // TODO: Remove currentHour:
        // currentHour doesn't need to get passed in (we could calculate the
        // current one here) but this makes it easy to test forcing it to
        // update to an hour other than the current one
        currentHour: action.currentHour,
      }
    case SET_LOW_BATTERY_MODE:
      return {
        ...state,
        lowBatteryMode: action.lowBatteryMode,
      }
    default:
      return state;
  }
}
