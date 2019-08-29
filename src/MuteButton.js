import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toggleMute } from './actions/videoActions';

import MuteIcon from './MuteIcon';
import UnmuteIcon from './UnmuteIcon';

import { css } from 'emotion';

const muteButton = css`
  padding: 1rem;
  &:hover {
    cursor: pointer;
    opacity: .9;
    margin-top: 1px;
  }
`;

class MuteButton extends Component {
  toggleMute = () => {
    this.props.toggleMute(this.props.video.muted);
  }

  render() {
    return (
      <div className={muteButton} onClick={this.toggleMute}>
        {this.props.video.muted &&
          <UnmuteIcon />
        }
        {!this.props.video.muted &&
          <MuteIcon />
        }
      </div>
    );
  }
}

const mapStateToProps = state => ({
  video: state.video
});

export default connect(mapStateToProps, { toggleMute })(MuteButton);
