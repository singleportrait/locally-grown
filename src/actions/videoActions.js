import { ADD_VIDEO_PLAYER } from './videoTypes';

export const addVideoPlayer = (player) => dispatch => {
  dispatch({
    type: ADD_VIDEO_PLAYER,
    player: player
  })
}
