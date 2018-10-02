import { SET_CHANNELS, SET_FEATURED_CHANNELS, SET_AVAILABLE_CHANNELS } from '../actions/channelTypes';

// HOW BEST TO ORGANIZE THE STORE???
// currentChannelId = 27
// channel = this.props.availableChannels.find(channel => channel.sys.id === this.props.currentChannelId)
// (^^ this could also be)
// channel = this.props.currentChannel()
// vs
// channel = this.props.currentChannel

const initialState = {
  isLoaded: false,
  allChannels: [],
  featuredChannels: [], // Active, featured channels
  availableChannels: [], // Channels with programs w program blocks for this hour
  currentChannel: {},
  currentChannelIndex: null,
  // nextChannelSlug: null, // For <Link>ing previous/next channel
  // previousChannelSlug: null,
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
    case SET_FEATURED_CHANNELS:
      return {
        ...state,
        featuredChannels: action.channels
      }
    case SET_AVAILABLE_CHANNELS:
      return {
        ...state,
        availableChannels: action.channels
      }
    default:
      return state;
  }
};
