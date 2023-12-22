import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';

import { css } from '@emotion/css';

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

    const renderTooltip = (
      <Popover id="what-is-this-tooltip" className={popover}>
        <Tooltip
          title={"What is Locally Grown?"}
          descriptionHTML={renderDescription()}
        />
        </Popover>
    );

    return (
      <OverlayTrigger
        placement="bottom-start"
        rootClose={true}
        trigger="click"
        overlay={renderTooltip}
      >
        <h4 className={tooltipTrigger}>What is this?</h4>
      </OverlayTrigger>
    );

  }
}

const popover = css`
  z-index: 2; // Higher z-index to cover TV Guide sticky hour headers
`;

const tooltipTrigger = css`
  text-decoration: underline;
  cursor: pointer;
`;

WhatIsThisTooltip.defaultProps = {
  showLink: true
}

export default WhatIsThisTooltip;
