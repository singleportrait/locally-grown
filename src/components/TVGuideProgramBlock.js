import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';

import { css } from 'emotion';

import { programBlockBase } from '../styles';

import Tooltip from './Tooltip';
import RemindLink from './RemindLink';

function TVGuideProgramBlock(props) {

  const renderTooltip = (
    <Popover id="info-and-remind-links">
      <Tooltip
        title={props.programBlock.fields.title}
        description={props.programBlock.fields.description}
        tooltipClassName={programBlockTooltip}
      />
    </Popover>
  );

  const renderProgramBlock = (
    <div
      className={props.firstHour ? firstHour : otherHours}
      style={props.programBlock.fields.description && {cursor: "pointer"}}
    >
      {props.programBlock.fields.title}
      { !props.firstHour &&
        <div className={programHoverLinks}>
          { props.programBlock.fields.description &&
            <span className={programHoverLink}>??</span>
          }
          <RemindLink
            programBlock={props.programBlock}
            className={programHoverLink}
            channelTitle={props.channelTitle}
            channelSlug={props.channelSlug}
          />
        </div>
      }
    </div>
  );

  return (
    <>
      { props.programBlock.fields.description && !props.firstHour &&
        <OverlayTrigger
          trigger="click"
          rootClose={true}
          placement="bottom-start"
          overlay={renderTooltip}
          popperConfig={{
            modifiers: { computeStyle: { gpuAcceleration: false } }
          }}
        >
          { renderProgramBlock }
        </OverlayTrigger>
      }
      { (!props.programBlock.fields.description || props.firstHour) && renderProgramBlock }
    </>
  );
}

const programBlockBaseStyle = `
  ${programBlockBase};
  color: #000;
  font-weight: 500;
  font-size: 15px;

  &:hover div {
    display: block;
  }
`;

const firstHourHoverColor = "#d2d1d6";
const otherHoursHoverColor = "#858090";

const firstHour = css`
  ${programBlockBaseStyle}
  background-color: #fff;

  span, a {
    color: #000;
  }

  &:hover {
    cursor: pointer;
    background-color: ${firstHourHoverColor};

    div {
      background-color: ${firstHourHoverColor};
      // Hex with alpha (00 = 0%, FF = 100%)
      background: linear-gradient(to right, ${firstHourHoverColor}00 0%, ${firstHourHoverColor}ff 10%, ${firstHourHoverColor}ff 100%);
    }
  }
`;

const otherHours = css`
  ${programBlockBaseStyle}
  background-color: #9b97a4;

  span, a {
    color: #fff;
  }

  &:hover {
    background-color: ${otherHoursHoverColor};

    div {
      background-color: ${otherHoursHoverColor};
      background: linear-gradient(to right, ${otherHoursHoverColor}00 0%, ${otherHoursHoverColor}ff 10%, ${otherHoursHoverColor}ff 100%);
    }
  }
`;

const programHoverLinks = css`
  display: none;
  position: absolute;
  right: 0;
  bottom: 0;
  padding-left: 10px;
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

export default TVGuideProgramBlock;
