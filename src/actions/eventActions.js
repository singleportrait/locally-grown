import { SET_EVENTS, SET_EVENTS_ERROR } from '../actions/eventTypes';

export const setEvents = events => dispatch => {
  dispatch({
    type: SET_EVENTS,
    events: events,
  })
};

export const setEventsError = error => dispatch => {
  dispatch({
    type: SET_EVENTS_ERROR,
    error: error
  })
}
