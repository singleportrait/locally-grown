import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import styled from 'react-emotion';

import * as moment from 'moment';

const ChannelsWrapper = styled('div')`
  margin: 1.4rem;
`;

class Channels extends Component {
  componentDidMount() {
    document.title = "All Channels | Locally Grown";
  }

  render() {
    // TODO: Check if each featured program is in available programs.
    // --Find program block for the current hour within (first?) active program--
    // If not, we'll show something different:
    // "Nothing playing right now for this channel."
    return (
      <ChannelsWrapper>
        <h1>Locally Grown Channels</h1>
        <p>It's {moment(Date.now()).format("h:mma")}.</p>
        <Link to="/">Back to first program</Link>
        <hr />
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
