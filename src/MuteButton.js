import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toggleMute } from './actions/sessionActions';

class MuteButton extends Component {
  toggleMute = () => {
    this.props.toggleMute(this.props.session.muted);
  }

  render() {
    return (
      <button onClick={this.toggleMute}>
        {this.props.session.muted ? 'Unmute' : 'Mute'}
      </button>
    );
  }
}

const mapStateToProps = state => ({
  session: state.session
});

export default connect(mapStateToProps, { toggleMute })(MuteButton);
