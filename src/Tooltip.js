import React, { Component } from 'react';
import Markdown from 'react-markdown';

import styled from '@emotion/styled';
import { css } from 'emotion';

class Tooltip extends Component {
  render() {
    return (
      <TooltipWrapper
        {...this.props}
        className={this.props.tooltipClassName}
        relativePosition={this.props.relativePosition}
      >
        <div className={this.props.titleClassName}>
          <h4>
            {this.props.title}
          </h4>
        </div>
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
  position: ${props => props.relativePosition ? 'relative' : 'absolute'};
  z-index: 1;
  background-color: #fff;
  color: #000;
  padding: 1rem;
  width: 350px;
  margin-top: 1rem;

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

Tooltip.defaultProps = {
  tooltipClassName: undefined,
  titleClassName: tooltipTitleStyle,
  description: undefined,
  descriptionHTML: undefined,
  relativePosition: undefined,
}

export default Tooltip;
