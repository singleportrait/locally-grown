import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import styled from 'react-emotion';

const ChannelsWrapper = styled('div')`
  background-color: #aaa;
  padding: 1rem;
`;

class Channels extends Component {
  render() {
    // TODO: Check if each featured program is in available programs.
    // If not, we'll show something different:
    // "Nothing playing right now for this channel."
    return (
      <ChannelsWrapper>
        <h1>K-SBI Channels</h1>
        <h2>{this.props.testProp}</h2>
        <Link to="/">Back to first program</Link>
        { this.props.featuredPrograms.map(({fields}, i) =>
          <div key={i}>
            {fields.title}
          </div>
        )}
      </ChannelsWrapper>
    );
  }
}

const mapStateToProps = state => ({
  featuredPrograms: state.programs.featuredPrograms
});

//export default Channel;
export default connect(mapStateToProps, {})(Channels);
