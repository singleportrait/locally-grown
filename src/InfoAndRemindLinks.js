import React, { Component } from 'react';
import Overlay from 'react-overlays/Overlay';

import { css } from 'emotion';

import Tooltip from './Tooltip';
import RemindLink from './RemindLink';

class InfoAndRemindLinks extends Component {

  render() {

    return (
      <React.Fragment>
        { this.props.programBlock.fields.description &&
          <React.Fragment>
            <span className={programHoverLink} onClick={this.props.toggleTooltip} >??</span>
            <Overlay
              show={this.props.show}
              onHide={this.props.toggleTooltip}
              placement="bottom"
              rootClose={true}
              target={this.props.target}
            >
              <Tooltip
                tooltipClassName={programBlockTooltip}
                title={this.props.programBlock.fields.title}
                description={this.props.programBlock.fields.description}
                close={this.props.toggleTooltip}
              />
            </Overlay>
          </React.Fragment>
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

const programHoverLink = css`
  text-decoration: underline;
  cursor: pointer;
  display: inline-block;
  padding: 1px 8px 4px;
`;

const programBlockTooltip = css`
  margin-left: 100px;
  margin-top: 2px;

  @media (max-width: 600px) {
    margin-left: 1rem;
  }
`;

export default InfoAndRemindLinks;
