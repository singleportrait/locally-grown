import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import styled from '@emotion/styled';

import LeftArrow from './LeftArrow';
import RightArrow from './RightArrow';

const ChannelButtonLink = styled('div')`
  padding: 1rem;
  &:hover {
    cursor: pointer;
    opacity: .9;
    margin-top: 1px;
  }
  ${props => props.direction === 'previous' && 'padding: 1rem 1rem 1rem 0;'}
  ${props => props.direction === 'next' && 'padding: 1rem 0 1rem 1rem;'}
`;

class ChannelButton extends Component {
  render() {
    return (
      <Link to={`/${this.props.to}`}>
        <ChannelButtonLink direction={this.props.direction}>
          { this.props.direction === "previous" &&
            <LeftArrow />
          }
          { this.props.direction === "next" &&
            <RightArrow />
          }
        </ChannelButtonLink>
      </Link>
    );
  }
}

export default ChannelButton;
