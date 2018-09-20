import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';

import Channel from './Channel';
import TVGuide from './TVGuide';
import Channels from './Channels';
import './styles/App.css';

import store from './store';

class App extends Component {
  // <Route path=":channel" component={Channel} />
  render() {
    return (
      <Provider store={store}>
        <Router>
          <div className="App">
            <Route path="/" component={Channel} />
            <Route path="/tv-guide" component={TVGuide} />
            <Route path="/channels" render={props => (
              <Channels testProp="test prop" />
            )} />
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
