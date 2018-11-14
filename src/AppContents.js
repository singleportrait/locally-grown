import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect, Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { initializeSession } from './actions/sessionActions';
import { initializeChannels } from './operations/channelOperations';

import Channel from './Channel';
import TVGuide from './TVGuide';
import Channels from './Channels';

import styled from 'react-emotion';

import { Logo } from './styles';

const LoadingContainer = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  height: 100vh;
  width: 100vw;
`;

class AppContents extends Component {
  componentDidMount() {
    this.props.initializeSession();
    this.props.initializeChannels();
  }

  render() {
    function NoPrograms() {
      return (
        <LoadingContainer>
          <Logo>Locally Grown</Logo>
          <h1>No programs right now.</h1>
          <br /><br />
          <h4 style={{textDecoration: "underline"}}>What is this?</h4>
        </LoadingContainer>
      );
    };

    function NoMatch() {
      return (
        <LoadingContainer>
          <Logo>Locally Grown</Logo>
          <h1>Sorry, we couldn't find that.</h1>
          <br /><br />
          <h4><Link to="/tv-guide">Find something to watch.</Link></h4>
        </LoadingContainer>
      );
    };

    function LoadingState() {
      return (
        <LoadingContainer>
          <Logo>&nbsp;</Logo>
          <h1>Loading Locally Grown...</h1>
          <br /><br />
          <h4>&nbsp;</h4>
        </LoadingContainer>
      );
    }

    return (
      <Router>
        <div className="App">
          { this.props.channels.isLoaded &&
            <Switch>
              { this.props.channels.availableChannels.map((channel, i) =>
                <Route key={i} path={`/${channel.fields.slug}`} render={props => (
                  <Channel {...props} channel={channel} />
                )} />
              )}
              { this.props.channels.hiddenChannels.map((channel, i) =>
                <Route key={i} path={`/${channel.fields.slug}`} render={props => (
                  <Channel {...props} channel={channel} />
                )} />
              )}
              { this.props.channels.currentChannel &&
                <Route exact path="/" render={props => (
                  <Redirect to={`/${this.props.channels.currentChannel.fields.slug}`} />
                )} />
              }
              <Route path="/tv-guide" render={props => (
                <TVGuide {...props} channels={this.props.channels.featuredChannels} />
              )} />
              <Route path="/channels" render={props => (
                <Channels {...props} featuredChannels={this.props.channels.featuredChannels} />
              )} />

              { !this.props.channels.currentChannel &&
                <Route exact path="/" component={NoPrograms} />
              }
              <Route component={NoMatch} />
            </Switch>
          }
          { !this.props.channels.isLoaded && LoadingState() }
        </div>
      </Router>
    );
  }
}

const mapStateToProps = state => ({
  channels: state.channels
});

export default connect(mapStateToProps, { initializeSession, initializeChannels })(AppContents);
