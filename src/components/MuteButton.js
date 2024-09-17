import React, { Component } from 'react';

import { css } from '@emotion/css';

import MuteIcon from './MuteIcon';
import UnmuteIcon from './UnmuteIcon';

const muteButton = css`
  padding: 1rem;
  &:hover {
    cursor: pointer;
    opacity: .9;
    margin-top: 1px;
  }
`;

class MuteButton extends Component {
  render() {
    return (
      <div className={muteButton} onClick={this.props.toggleMute}>
        {this.props.muted &&
          <UnmuteIcon />
        }
        {!this.props.muted &&
          <MuteIcon />
        }
      </div>
    );
  }
}

export default MuteButton;
