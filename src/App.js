import React, { Component } from 'react';
import { Provider } from 'react-redux';

import ReactGA from 'react-ga';
import AppContents from './AppContents';
import UserProvider from './providers/UserProvider';

import store from './store';

class App extends Component {
  // <Route path=":channel" component={Channel} />

  render() {
    console.log("Version b37d9e");

    ReactGA.initialize('UA-133302828-1', {
      debug: false,
    });

    return (
      <UserProvider>
        <Provider store={store}>
          <AppContents />
        </Provider>
      </UserProvider>
    );
  }
}

export default App;
