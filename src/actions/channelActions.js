import { SET_CHANNELS, SETUP_CHANNELS } from '../actions/channelTypes';

export const setChannels = channels => dispatch => {
  dispatch({
    type: SET_CHANNELS,
    channels: channels
  })
};

export const setupChannels = (featured, available, hidden, current) => dispatch => {
  dispatch({
    type: SETUP_CHANNELS,
    featured: featured,
    available: available,
    hidden: hidden,
    current: current
  })
}
