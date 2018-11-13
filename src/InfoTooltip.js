import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import Overlay from 'react-overlays/lib/Overlay';

import { css } from 'react-emotion';

import CloseIcon from './CloseIcon';
import { Tooltip, tooltipHeader, tooltipCloseButton } from './styles';

class InfoTooltip extends Component {
  render() {
    return (
      <React.Fragment>
        <span
          className={tooltipTrigger}
          ref={(t) => { this.target = t; }}
          onClick={this.props.toggleInfo}
        >Info</span>
        <Overlay
          show={this.props.showInfo}
          onHide={this.props.toggleInfo}
          placement="bottom"
          rootClose={true}
          target={() => findDOMNode(this.target)}
        >
          <Tooltip>
            <div className={tooltipHeader}>
              <h4>{this.props.title}</h4>
              <div className={tooltipCloseButton} onClick={this.props.toggleInfo}>
                <CloseIcon color="#000" />
              </div>
            </div>
            {this.props.description &&
                <p>{this.props.description}</p>
            }
            {!this.props.description &&
                <p><em>This program doesn't have a description!</em></p>
            }
          </Tooltip>
        </Overlay>
      </React.Fragment>
    );
  }
}

const tooltipTrigger = css`
  text-decoration: underline;
  margin-left: .3rem;
  cursor: pointer;
`;

export default InfoTooltip;

