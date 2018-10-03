import { ADD_VIDEO_PLAYER } from '../actions/videoTypes';

const initialState = {
  // muted: true,
  // volume: 0,
  player: null
}

export default function(state = initialState, action) {
  switch (action.type) {
    case ADD_VIDEO_PLAYER:
      return {
        ...state,
        player: action.player
      }
    default:
      return state;
  }
}
