import { SET_CHANNELS, SET_FEATURED_CHANNELS, SET_AVAILABLE_CHANNELS } from './channelTypes.js';

export const setChannels = channels => dispatch => {
  dispatch({
    type: SET_CHANNELS,
    channels: channels
  })
};

export const setFeaturedChannels = channels => dispatch => {
  dispatch({
    type: SET_FEATURED_CHANNELS,
    channels: channels
  })
}

export const setAvailableChannels = channels => dispatch => {
  dispatch({
    type: SET_AVAILABLE_CHANNELS,
    channels: channels
  })
}
