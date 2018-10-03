import { SET_SECONDS_UNTIL_NEXT_PROGRAM, TOGGLE_MUTE } from '../actions/sessionTypes';

const initialState = {
  currentHour: new Date().getHours(),
  secondsUntilNextProgram: null,
  muted: true,
  volume: 0
}

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_SECONDS_UNTIL_NEXT_PROGRAM:
      return {
        ...state,
        secondsUntilNextProgram: action.secondsUntilNextProgram
      }
    case TOGGLE_MUTE:
      return {
        ...state,
        muted: action.muted,
        volume: action.volume
      }
    default:
      return state;
  }
}
