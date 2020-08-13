import { SET_CHANNELS, SETUP_CHANNELS, CHANNELS_LOAD_ERROR } from '../actions/channelTypes';

// HOW BEST TO ORGANIZE THE STORE???
// currentChannelId = 27
// channel = this.props.carouselChannels.find(channel => channel.sys.id === this.props.currentChannelId)
// (^^ this could also be)
// channel = this.props.currentChannel()
// vs
// channel = this.props.currentChannel
// channels: [{isFeatured: true, isAvailable: false, isHidden: true}]
// Then you'd have to map through channels and only display ones w properties you want? Weird

const initialState = {
  isLoaded: false,
  allChannels: [],
  featuredChannels: [], // Active, featured channels
  carouselChannels: [], // Channels with programs w program blocks for this hour
  noncarouselChannels: [],
  currentChannel: null,
  error: null
}

export default function(state = initialState, action) {
  switch (action.type) {
    case SET_CHANNELS:
      return {
        ...state,
        allChannels: action.channels,
        isLoaded: true
      }
    case SETUP_CHANNELS:
      return {
        ...state,
        featuredChannels: action.featured,
        carouselChannels: action.carousel,
        noncarouselChannels: action.noncarousel,
        currentChannel: action.current
      }
    case CHANNELS_LOAD_ERROR:
      return {
        ...state,
        isLoaded: true,
        error: true
      }
    default:
      return state;
  }
};
