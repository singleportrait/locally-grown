import { SET_CHANNELS, SETUP_CHANNELS, CHANNELS_LOAD_ERROR } from '../actions/channelTypes';

export const setChannels = channels => dispatch => {
  dispatch({
    type: SET_CHANNELS,
    channels: channels
  })
};

export const setupChannels = (featured, carousel, noncarousel, current) => dispatch => {
  dispatch({
    type: SETUP_CHANNELS,
    featured: featured,
    carousel: carousel,
    noncarousel: noncarousel,
    current: current
  })
};

export const errorLoadingChannels = () => dispatch => {
  dispatch({
    type: CHANNELS_LOAD_ERROR
  })
};
