import { SET_SECONDS_UNTIL_NEXT_PROGRAM } from '../actions/sessionTypes';

const initialState = {
  currentHour: new Date().getHours(),
  secondsUntilNextProgram: null
}

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_SECONDS_UNTIL_NEXT_PROGRAM:
      return {
        ...state,
        secondsUntilNextProgram: action.secondsUntilNextProgram
      }
    default:
      return state;
  }
}
