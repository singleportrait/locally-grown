import React, { Component } from 'react';

import Video from './Video';

class ProgramBlock extends Component {
  render() {
    const programBlock = this.props.programBlock;
    return (
      <div>
        <p>Now playing:</p>
        <h1>{programBlock.fields.title}</h1>
        <p>Description: {programBlock.fields.description}</p>
        <Video
          video={programBlock.currentVideo}
          timestamp={programBlock.timestampToStartVideo}
        />
      </div>
    )
  }
}

export default ProgramBlock;
