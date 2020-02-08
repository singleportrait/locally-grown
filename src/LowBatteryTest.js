import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled/macro';
import consoleLog from './consoleLog';

import { setLowBatteryMode } from './actions/sessionActions';

import lowBatteryTestVideo from './purpleBackground100px.mp4';

class LowBatteryTest extends Component {
  constructor(props) {
    super(props);

    this.state = {
      suspended: false,
    }
  }

  setSuspended = () => {
    consoleLog("Is this really suspended?", this.state.suspended);
    if (this.state.suspended) {
      this.props.setLowBatteryMode(true);
    }
  }

  handleSuspend = (event) => {
    // Suspend invoked (either when video is loaded, or if it won't play)
    // This gets called even when the phone is not on low battery,
    // which is why we need to set a timeout, wait to see if it got un-suspended
    // and if it didn't, show the user the low battery warning
    const onSuspendDate = new Date();
    const onSuspendTime = onSuspendDate.getMinutes() + ":" + onSuspendDate.getSeconds() + ":" + onSuspendDate.getMilliseconds();
    consoleLog("- Video suspended by browser", onSuspendTime);

    this.setState({
      suspended: true
    });

    setTimeout(this.setSuspended, 100);
  }

  handlePlay = (event) => {
    this.setState({
      suspended: false
    });
  }

  handleTestVideoClick = (event) => {
    consoleLog("- User chose to play");
  }

  render() {
    return (
      <Video
        autoPlay
        muted
        playsInline
        loop
        onSuspend={this.handleSuspend}
        onPlay={this.handlePlay}
        onClick={this.handleTestVideoClick}
      >
        <source src={lowBatteryTestVideo} type="video/mp4" />
        Sorry, your browser doesn't support embedded videos.
      </Video>
    );
  }
}

const Video = styled('video')`
  width: 50px;
  height: 50px;
  position: absolute;
  top: 50%;
  opacity: 1;
  z-index: 100;
  // visibility: hidden;
`;

const mapStateToProps = state => ({
  session: state.session,
});

export default connect(mapStateToProps, { setLowBatteryMode })(LowBatteryTest);
