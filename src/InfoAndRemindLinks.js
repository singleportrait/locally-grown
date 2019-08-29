import React, { Component } from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';

import { css } from 'emotion';

import Tooltip from './Tooltip';
import RemindLink from './RemindLink';

class InfoAndRemindLinks extends Component {

  render() {

    const renderTooltip = (
      <Popover id="info-and-remind-links" className={popoverStyle}>
        <Tooltip
          title={this.props.programBlock.fields.title}
          descriptionHTML={this.props.programBlock.fields.description}
          tooltipClassName={programBlockTooltip}
        />
      </Popover>
    );

    return (
      <React.Fragment>
        { this.props.programBlock.fields.description &&
          <OverlayTrigger
            trigger="click"
            rootClose={true}
            placement="bottom-start"
            overlay={renderTooltip}
            popperConfig={{
              modifiers: { computeStyle: { gpuAcceleration: false } }
            }}
          >
            <span className={programHoverLink}>??</span>
          </OverlayTrigger>
        }
        { !this.props.firstHour &&
          <RemindLink
            programBlock={this.props.programBlock}
            className={programHoverLink}
            channelTitle={this.props.channelTitle}
            channelSlug={this.props.channelSlug}
          />
        }
      </React.Fragment>
    );
  }
}

const popoverStyle = css`
  @media (max-width: 600px) {
    left: 1rem !important;
  }
`;

const programHoverLink = css`
  text-decoration: underline;
  cursor: pointer;
  display: inline-block;
  padding: 1px 8px 4px;
`;

const programBlockTooltip = css`
  margin-top: 2px;
`;

export default InfoAndRemindLinks;
