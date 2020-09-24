import { SET_CHANNELS, SETUP_CHANNELS, CHANNELS_LOAD_ERROR } from '../actions/channelTypes';

export const setChannels = channels => dispatch => {
  dispatch({
    type: SET_CHANNELS,
    channels: channels
  })
};

export const setupChannels = (featured, carousel, nonCarousel, current) => dispatch => {
  dispatch({
    type: SETUP_CHANNELS,
    featured: featured,
    carousel: carousel,
    nonCarousel: nonCarousel,
    current: current
  })
};

export const errorLoadingChannels = () => dispatch => {
  dispatch({
    type: CHANNELS_LOAD_ERROR
  })
};
