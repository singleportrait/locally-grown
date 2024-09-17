import { SET_SCREENINGS, SET_SCREENINGS_ERROR } from '../actions/screeningTypes';

export const setScreenings = screenings => dispatch => {
  dispatch({
    type: SET_SCREENINGS,
    screenings: screenings,
  })
};

export const setScreeningsError = error => dispatch => {
  dispatch({
    type: SET_SCREENINGS_ERROR,
    error: error
  })
}
