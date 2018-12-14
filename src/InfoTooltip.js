import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import Overlay from 'react-overlays/lib/Overlay';

import { css } from 'react-emotion';

import CloseIcon from './CloseIcon';
import { Tooltip, tooltipHeader, tooltipCloseButton } from './styles';

class InfoTooltip extends Component {
  render() {
    const user = this.props.user;

    return (
      <React.Fragment>
        <span
          className={tooltipTrigger}
          ref={(t) => { this.target = t; }}
          onClick={this.props.toggleInfo}
        >Info</span>
        <Overlay
          show={this.props.show}
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
            {user &&
              <React.Fragment>
                <br />
                <p><strong>{user.fields.name}</strong></p>
                {user.fields.description &&
                  <p>{user.fields.description}</p>
                }
              </React.Fragment>
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
