import { ADD_VIDEO_PLAYER, TOGGLE_MUTE } from './videoTypes';

export const addVideoPlayer = (player) => dispatch => {
  dispatch({
    type: ADD_VIDEO_PLAYER,
    player: player
  })
}

export const toggleMute = (muted) => dispatch => {
  dispatch({
    type: TOGGLE_MUTE,
    muted: !muted,
    volume: !muted ? 0 : 1
  })
}
