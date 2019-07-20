import React, { Component } from 'react';
import { Provider } from 'react-redux';

import ReactGA from 'react-ga';
import AppContents from './AppContents';

import store from './store';

class App extends Component {
  // <Route path=":channel" component={Channel} />

  render() {
    console.log("Version 7357c4");

    ReactGA.initialize('UA-133302828-1', {
      debug: false,
    });

    return (
      <Provider store={store}>
        <AppContents />
      </Provider>
    );
  }
}

export default App;
