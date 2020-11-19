import React, { Component } from 'react';
import screenfull from 'screenfull';
import { css } from 'emotion';

import consoleLog from '../helpers/consoleLog';

import FullscreenIcon from './FullscreenIcon';

class FullscreenPageButton extends Component {
  goFullscreen = () => {
    if (screenfull.enabled) {
      screenfull.toggle();
    } else {
      consoleLog("This isn't supported");
    }
  }

  render() {
    return (
      <React.Fragment>
        { screenfull.enabled &&
          <div className={fullscreenButton} onClick={this.goFullscreen}>
            <FullscreenIcon />
          </div>
        }
      </React.Fragment>
    );
  }
}

const fullscreenButton = css`
  padding: 1rem;
  &:hover {
    cursor: pointer;
    opacity: .9;
    margin-top: 1px;
  }
`;

export default FullscreenPageButton;
