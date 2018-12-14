import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { findDOMNode } from 'react-dom';
import Overlay from 'react-overlays/lib/Overlay';

import { css } from 'react-emotion';

import CloseIcon from './CloseIcon';
import { Tooltip, tooltipHeader, tooltipCloseButton } from './styles';

const darkLink = css`
  &, &:visited, &:hover, &:active {
    color: #000;
  }
`;

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
          onHide={this.props.toggleInfo}
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
            <p>
              Locally Grown is something you can leave on because you trust us. Grassroots TV-esque format meant to be exactly what it needs to be.
            </p>
            { this.props.showLink &&
              <React.Fragment>
                <br />
                <Link to="/channels" className={darkLink}>View all channels</Link>
              </React.Fragment>
            }
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

WhatIsThisTooltip.defaultProps = {
  showLink: true
}

export default WhatIsThisTooltip;
