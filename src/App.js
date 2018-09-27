import React, { Component } from 'react';
import { Provider } from 'react-redux';

import AppContents from './AppContents';
import './styles/App.css';

import store from './store';

class App extends Component {
  // <Route path=":channel" component={Channel} />
  render() {
    return (
      <Provider store={store}>
        <AppContents />
      </Provider>
    );
  }
}

export default App;
