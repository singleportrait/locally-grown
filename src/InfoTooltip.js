import React, { Component } from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import Markdown from 'react-markdown';

import { css } from 'emotion';

import Tooltip from './Tooltip';

class InfoTooltip extends Component {
  render() {
    const user = this.props.user;

    const renderDescription = () => {
      return (
        <React.Fragment>
          {this.props.description &&
            <div>
              <Markdown source={this.props.description} />
            </div>
          }
          {!this.props.description &&
            <p><em>This program doesn&apos;t have a description!</em></p>
          }
          {user &&
            <React.Fragment>
              <br />
              <p><strong>{user.fields.name}</strong></p>
              {user.fields.description &&
                <div>
                  <Markdown source={user.fields.description} />
                </div>
              }
            </React.Fragment>
          }
        </React.Fragment>
      );
    };

    // Could potentially use <Overlay> instead of <OverlayTrigger> to set a manual container for the tooltip on <WideProgramContainer>, so that this awkward custom positioning doesn't have to happen in the sidebar
    const renderTooltip = (
      <Popover id="info-and-remind-links">
        <Tooltip
          title={this.props.title}
          descriptionHTML={renderDescription()}
          relativePosition={true}
          tooltipClassName={infoTooltipStyle}
        />
      </Popover>
    );

    return (
      <OverlayTrigger
        trigger="click"
        rootClose={true}
        placement="left"
        overlay={renderTooltip}
      >
        <span className={tooltipTrigger}>Info</span>
      </OverlayTrigger>
    );
  }
}

const infoTooltipStyle = css`
  top: 4rem;
  left: 2rem;
`;

const tooltipTrigger = css`
  text-decoration: underline;
  margin-left: .3rem;
  cursor: pointer;
`;

export default InfoTooltip;
