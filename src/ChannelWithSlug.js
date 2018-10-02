import React, { Component } from 'react';

class ChannelWithSlug extends Component {
  render() {
    return (
      <h1>Channel here: {this.props.channel.fields.title}</h1>
    );
  }
}

export default ChannelWithSlug;
