import React, { Component, createRef } from 'react';
import Markdown from 'react-markdown';
import ReactTooltip from 'react-tooltip';

import styled from '@emotion/styled';
import { css } from 'emotion';

import CloseIcon from './CloseIcon';

class RTooltip extends Component {
  constructor(props) {
    super(props);

    this.tooltipRef = createRef();
  }

  componentDidMount() {
    // console.log("RTooltip ref", this.tooltipRef);
  }

  render() {

    const closeTooltip = () => {
      const current = this.tooltipRef.current;
      if (current) {
        current.tooltipRef = null;
      }
      ReactTooltip.hide();
    }

    return (
      <ReactTooltip
        id={this.props.id}
        place={this.props.placement}
        event="click"
        globalEventOff="click"
        type="light"
        clickable={true}
        className={reactTooltipStyle}
        ref={this.tooltipRef}
        customLeftPosition="1rem"
      >
        <TooltipWrapper
          className={this.props.tooltipClassName}
          positionAtMouse={this.props.positionAtMouse}
        >
          { this.props.title &&
            <div className={this.props.titleClassName}>
              <h4>
                {this.props.title}
              </h4>
              <div className={tooltipCloseButtonStyle} onClick={closeTooltip}>
                <CloseIcon color="#000" />
              </div>
            </div>
          }
          { this.props.description &&
            <div>
              <Markdown source={this.props.description} />
            </div>
          }
          { this.props.descriptionHTML &&
            <div>{this.props.descriptionHTML}</div>
          }
        </TooltipWrapper>
      </ReactTooltip>
    );
  }
}

const reactTooltipStyle = css`
  ${props => props.customLeftPosition && `left: ${props.customLeftPosition} !important`};

  @media (max-width: 600px) {
    left: 1rem !important;
  }
`;

const TooltipWrapper = styled('div')`
  ${props => props.positionAtMouse && `position: absolute;`};
  background-color: #fff;
  color: #000;
  padding: 1rem;
  width: 350px;

  a, a:visited, a:hover, a:active {
    color: inherit;
  }

  @media (max-width: 600px) {
    width: calc(100vw - 2rem);
  }
`;

const tooltipTitleStyle = css`
  display: flex;
  justify-content: space-between;
`;

const tooltipCloseButtonStyle = css`
  cursor: pointer;
`;

RTooltip.defaultProps = {
  tooltipClassName: undefined,
  titleClassName: tooltipTitleStyle,
  description: undefined,
  descriptionHTML: undefined,
  placement: "bottom",
  positionAtMouse: undefined,
}

export default RTooltip;
