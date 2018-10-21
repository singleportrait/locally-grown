import { ADD_VIDEO_PLAYER, TOGGLE_MUTE } from '../actions/videoTypes';

const initialState = {
  muted: true,
  volume: 0,
  player: null
}

export default function(state = initialState, action) {
  switch (action.type) {
    case ADD_VIDEO_PLAYER:
      return {
        ...state,
        player: action.player
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
