import React, { Component } from 'react';

import styled from '@emotion/styled';
import { css } from 'emotion';

import InfoAndRemindLinks from './InfoAndRemindLinks';
import { programBlockBase } from './styles';

class TVGuideProgramBlock extends Component {

  render() {

    return (
      <ProgramBlock
        className={this.props.firstHour && firstHour}
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
      </ProgramBlock>
    );
  }
}

const ProgramBlock = styled('div')`
  ${programBlockBase};
  background-color: #999;
  color: #000;
  font-weight: 500;
  font-size: 15px;

  &:hover div {
    display: block;
  }
`;

const firstHour = css`
  background-color: #fff;

  span, a {
    color: #000;
  }

  &:hover {
    cursor: pointer;
    background-color: #d2d1d6;

    div {
      background-color: #d2d1d6;
      background: linear-gradient(to right, rgba(210,209,214,0) 0%,rgba(210,209,214,1) 10%,rgba(210,209,214,1) 100%);
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
