import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import styled from 'react-emotion';

const ChannelsWrapper = styled('div')`
  background-color: #333;
  padding: 1rem;
`;

class Channels extends Component {
  componentDidMount() {
    document.title = "All Channels | K-SBI";
  }

  render() {
    // TODO: Check if each featured program is in available programs.
    // If not, we'll show something different:
    // "Nothing playing right now for this channel."
    return (
      <ChannelsWrapper>
        <h1>K-SBI Channels</h1>
        <Link to="/">Back to first program</Link>
        { this.props.featuredChannels.map(({fields}, i) =>
          <div key={i}>
            {fields.title}
          </div>
        )}
      </ChannelsWrapper>
    );
  }
}

export default Channels;
