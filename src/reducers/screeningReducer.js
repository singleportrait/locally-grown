import { SET_SCREENINGS, SET_SCREENINGS_ERROR } from '../actions/screeningTypes';

const initialState = {
  screenings: [],
  error: null
}

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_SCREENINGS:
      return {
        ...state,
        screenings: action.screenings
      }
    case SET_SCREENINGS_ERROR:
      return {
        ...state,
        error: action.error
      }
    default:
      return state;
  }
};
