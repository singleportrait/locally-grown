import React, { Component } from 'react';
import { Provider } from 'react-redux';

import Channel from './Channel';
import './styles/App.css';

import store from './store';

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <div className="App">
          <Channel />
        </div>
      </Provider>
    );
  }
}

export default App;
