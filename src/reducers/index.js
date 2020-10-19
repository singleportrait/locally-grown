import { combineReducers } from 'redux';
import channelReducer from './channelReducer';
import sessionReducer from './sessionReducer';
import programBlockReducer from './programBlockReducer';
import videoReducer from './videoReducer';
import eventReducer from './eventReducer';

export default combineReducers({
  session: sessionReducer,
  channels: channelReducer,
  programBlocks: programBlockReducer,
  video: videoReducer,
  events: eventReducer
});
