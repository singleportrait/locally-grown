import { SET_CHANNELS, SET_FEATURED_CHANNELS, SET_AVAILABLE_CHANNELS, SET_HIDDEN_CHANNELS, SET_CURRENT_CHANNEL_INFO } from '../actions/channelTypes';

// HOW BEST TO ORGANIZE THE STORE???
// currentChannelId = 27
// channel = this.props.availableChannels.find(channel => channel.sys.id === this.props.currentChannelId)
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
  availableChannels: [], // Channels with programs w program blocks for this hour
  hiddenChannels: [],
  currentChannel: null,
  // currentChannelIndex: null,
  // hasMultipleAvailableChannels: null,
  // previousChannelSlug: null, // For <Link>ing previous/next channel
  // nextChannelSlug: null,
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
    case SET_CURRENT_CHANNEL_INFO:
      return {
        ...state,
        currentChannel: action.channel
      }
    case SET_HIDDEN_CHANNELS:
      return {
        ...state,
        hiddenChannels: action.channels
      }
    default:
      return state;
  }
};
