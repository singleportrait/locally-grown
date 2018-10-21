import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toggleMute } from './actions/videoActions';

class MuteButton extends Component {
  toggleMute = () => {
    this.props.toggleMute(this.props.video.muted);
  }

  render() {
    return (
      <button onClick={this.toggleMute}>
        {this.props.video.muted ? 'Unmute' : 'Mute'}
      </button>
    );
  }
}

const mapStateToProps = state => ({
  video: state.video
});

export default connect(mapStateToProps, { toggleMute })(MuteButton);
