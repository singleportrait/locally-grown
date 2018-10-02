import { SET_CHANNELS, SET_FEATURED_CHANNELS, SET_AVAILABLE_CHANNELS, SET_HIDDEN_CHANNELS, SET_CURRENT_CHANNEL_INFO } from '../actions/channelTypes';

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

export const setHiddenChannels = channels => dispatch => {
  dispatch({
    type: SET_HIDDEN_CHANNELS,
    channels: channels
  })
}

export const setCurrentChannelInfo = channel => dispatch => {
  dispatch({
    type: SET_CURRENT_CHANNEL_INFO,
    channel: channel,
  })
}
