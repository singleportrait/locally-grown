import { SET_EVENTS, SET_EVENTS_ERROR } from '../actions/eventTypes';

const initialState = {
  events: [],
  error: null
}

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_EVENTS:
      return {
        ...state,
        events: action.events
      }
    case SET_EVENTS_ERROR:
      return {
        ...state,
        error: action.error
      }
    default:
      return state;
  }
};
