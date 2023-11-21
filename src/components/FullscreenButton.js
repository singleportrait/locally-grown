import React, { Component } from 'react';
import { connect } from 'react-redux';
import screenfull from 'screenfull';
import { findDOMNode } from 'react-dom'

import { css } from '@emotion/css';

import consoleLog from '../helpers/consoleLog';

import FullscreenIcon from './FullscreenIcon';

const fullscreenButton = css`
  padding: 1rem;
  &:hover {
    cursor: pointer;
    opacity: .9;
    margin-top: 1px;
  }
`;

class FullscreenButton extends Component {
  goFullscreen = () => {
    if (screenfull.enabled) {
      screenfull.request(findDOMNode(this.props.video.player));
    } else {
      consoleLog("This isn't supported");
    }

    // The official React way (doesn't work immediately)
    // screenfull.request(this.player.current);
  }

  render() {
    return (
      <React.Fragment>
        { this.props.video.player && screenfull.enabled &&
          <div className={fullscreenButton} onClick={this.goFullscreen}>
            <FullscreenIcon />
          </div>
        }
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  video: state.video
});

export default connect(mapStateToProps)(FullscreenButton);
