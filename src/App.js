import React, { Component } from 'react';
import { Provider } from 'react-redux';
import MediaQuery from 'react-responsive';

import ReactGA from 'react-ga';
import AppContents from './AppContents';
import ChatangoChat from './components/ChatangoChat';

import store from './store';

class App extends Component {
  // <Route path=":channel" component={Channel} />

  render() {
    console.log("Version b744af");

    ReactGA.initialize('UA-133302828-1', {
      debug: false,
    });

    return (
      <Provider store={store}>
        <AppContents />
        <MediaQuery minDeviceWidth={600} minWidth={400}>
          <ChatangoChat />
        </MediaQuery>
      </Provider>
    );
  }
}

export default App;
