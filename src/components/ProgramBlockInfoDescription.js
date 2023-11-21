import React, { Component } from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import Markdown from 'react-markdown';

import { css } from '@emotion/css';

import Tooltip from './Tooltip';
import RemindLink from './RemindLink';

class ProgramBlockInfoDescription extends Component {

  render() {

    const {
      fields: {
        title,
        description,
      }
    } = this.props.programBlock;

    const renderDescription = () => {
      return (
        <div>
          { description &&
            <React.Fragment>
              <Markdown>
                {description}
              </Markdown>
            </React.Fragment>
          }
          <br />
          <RemindLink
            programBlock={this.props.programBlock}
            channelTitle={this.props.channelTitle}
            channelSlug={this.props.channelSlug}
          />
        </div>
      );
    }

    const renderTooltip = (
      <Popover id="popover-info-description">
        <Tooltip
          title={title}
          tooltipClassName={descriptionTooltipStyle}
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
        <div className={programBlockDescriptionLink}>
          {title}
        </div>
      </OverlayTrigger>
    );
  }
}

const programBlockDescriptionLink = css`
  cursor: pointer;
  opacity: .6;
  transition: opacity .1s ease;

  &:hover {
    opacity: .8;
  }
`;

const descriptionTooltipStyle = css`
  width: auto;
  max-width: 250px;
`;

export default ProgramBlockInfoDescription;
