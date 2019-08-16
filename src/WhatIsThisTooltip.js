import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { findDOMNode } from 'react-dom';
import Overlay from 'react-overlays/Overlay';

import { css } from 'emotion';

import Tooltip from './Tooltip';

class WhatIsThisTooltip extends Component {
  render() {

    const renderDescription = () => {
      return (
        <React.Fragment>
          <p>Locally Grown is something you can leave on because you trust us. Grassroots TV-esque format meant to be exactly what it needs to be.</p>

          { this.props.showLink &&
            <p><Link to="/channels">View all channels</Link></p>
          }
        </React.Fragment>
      );
    }

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
          <Tooltip
            tooltipClassName={whatIsThisTooltip}
            title={"What is Locally Grown?"}
            descriptionHTML={renderDescription()}
            close={this.props.toggleInfo}
          />
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
