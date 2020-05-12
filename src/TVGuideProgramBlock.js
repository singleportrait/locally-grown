import React, { Component } from 'react';

import { css } from 'emotion';

import InfoAndRemindLinks from './InfoAndRemindLinks';
import { programBlockBase } from './styles';

class TVGuideProgramBlock extends Component {

  render() {

    return (
      <div
        className={this.props.firstHour ? firstHour : otherHours}
      >
        {this.props.programBlock.fields.title}
        <div className={this.props.firstHour ? programHoverFirstHourLinks : programHoverLinks}>
          <InfoAndRemindLinks
            programBlock={this.props.programBlock}
            firstHour={this.props.firstHour}
            channelSlug={this.props.channelSlug}
            channelTitle={this.props.channelTitle}
          />
        </div>
      </div>
    );
  }
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

const firstHour = css`
  ${programBlockBaseStyle}
  background-color: #fff;

  span, a {
    color: #000;
  }

  &:hover {
    cursor: pointer;
    background-color: #d2d1d6;

    div {
      background-color: #d2d1d6;
      // Hex with alpha (00 = 0%, FF = 100%)
      background: linear-gradient(to right, #d2d1d600 0%, #d2d1d6ff 10%, #d2d1d6ff 100%);
    }
  }
`;

const otherHours = css`
  ${programBlockBaseStyle}
  background-color: #9b97a4;

  &:hover {
    background-color: #858090;

    div {
      background-color: #858090;
      background: linear-gradient(to right, #85809000 0%, #858090ff 10%, #858090ff 100%);
    }
  }
`;

const programHoverBase = css`
  display: none;
  position: absolute;
  right: 0;
  bottom: 0;
  padding-left: 10px;
`;

const programHoverLinks = css`
  ${programHoverBase};
  background-color: #999;
  background: linear-gradient(to right, rgba(153,153,153,0) 0%,rgba(153,153,153,1) 10%,rgba(153,153,153,1) 100%);

  span, a {
    color: #fff;
  }
`;

const programHoverFirstHourLinks = css`
  ${programHoverBase};
  background-color: #fff;

  span, a {
    color: #000;
  }
`;

export default TVGuideProgramBlock;
