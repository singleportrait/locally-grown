import React, { Component } from 'react';
import styled, { css } from 'react-emotion';
import Markdown from 'react-markdown';

import CloseIcon from './CloseIcon';

class Tooltip extends Component {
  render() {
    return (
      <TooltipWrapper
        className={this.props.tooltipClassName}
        positionLeft={!this.props.ignorePositioning && this.props.positionLeft}
        positionTop={!this.props.ignorePositioning && this.props.positionTop}
      >
        { this.props.showTitle &&
          <div className={this.props.titleClassName}>
            <h4>
              {this.props.title}
            </h4>
            <div className={tooltipCloseButtonStyle} onClick={this.props.close}>
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
    );
  }
}

const TooltipWrapper = styled('div')`
  position: absolute;
  z-index: 1;
  background-color: #fff;
  color: #000;
  padding: 1rem;
  width: 400px;
  margin-top: 2rem;
  ${props => props.positionLeft && `left: ${props.positionLeft}px`};
  ${props => props.positionTop && `top: ${props.positionTop}px`};

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

Tooltip.defaultProps = {
  tooltipClassName: undefined,
  titleClassName: tooltipTitleStyle,
  showTitle: true,
  positionTop: 0,
  positionLeft: 0,
  description: undefined,
  descriptionHTML: undefined,
}

export default Tooltip;
