import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import styled from 'react-emotion';

const ChannelButtonLink = styled('div')`
  padding: 1rem;
  &:hover {
    background-color: #222;
  }
  // ${props => props.direction === 'previous' && 'background-color: navy;'}
  // ${props => props.direction === 'next' && 'background-color: purple;'}
`;

class ChannelButton extends Component {
  render() {
    return (
      <Link to={`/${this.props.to}`}>
        <ChannelButtonLink direction={this.props.direction}>
          { this.props.direction === "previous" &&
            <span>&larr; Previous channel</span>
          }
          { this.props.direction === "next" &&
            <span>Next channel &rarr;</span>
          }
        </ChannelButtonLink>
      </Link>
    );
  }
}

export default ChannelButton;
