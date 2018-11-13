import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import Overlay from 'react-overlays/lib/Overlay';

import { css } from 'react-emotion';

import CloseIcon from './CloseIcon';
import { Tooltip, tooltipHeader, tooltipCloseButton } from './styles';

class WhatIsThisTooltip extends Component {
  render() {
    return (
      <div>
        <h4
          className={tooltipTrigger}
          ref={(t) => { this.target = t; }}
          onClick={this.props.toggleInfo}
        >What is this?</h4>
        <Overlay
          show={this.props.showInfo}
          onHide={() => this.props.toggleInfo}
          placement="bottom"
          rootClose={true}
          target={() => findDOMNode(this.target)}
        >
          <Tooltip className={whatIsThisTooltip}>
            <div className={tooltipHeader}>
              <h4>What is Locally Grown?</h4>
              <div className={tooltipCloseButton} onClick={this.props.toggleInfo}>
                <CloseIcon color="#000" />
              </div>
            </div>
            <p>Locally Grown is a project that...</p>
          </Tooltip>
        </Overlay>
      </div>
    );
  }
}

const tooltipTrigger = css`
  text-decoration: underline;
  cursor: pointer;
`;

const whatIsThisTooltip = css`
  margin-left: 1rem;
`;

export default WhatIsThisTooltip;
