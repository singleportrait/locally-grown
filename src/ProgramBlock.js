import React, { Component } from 'react';
import { connect } from 'react-redux';
import { updateCurrentVideo } from './operations/programBlockOperations';

import Video from './Video';

class ProgramBlock extends Component {
  onUpdateVideo = () => {
    this.props.updateCurrentVideo();
    // Trigger the onUpdateVideo() function on the program block action
    console.log("Time to update the video!");
  }

  render() {
    const programBlock = this.props.programBlock;
    return (
      <div>
        <p>Now playing:</p>
        <h1>{programBlock.fields.title}</h1>
        <p>Description: {programBlock.fields.description}</p>
        <Video
          video={programBlock.currentVideo}
          onUpdateVideo={this.onUpdateVideo}
          timestamp={programBlock.timestampForCurrentVideo}
        />
      </div>
    )
  }
}

// I'll connect my onUpdateVideo() action through dispatch props here

export default connect(null, { updateCurrentVideo })(ProgramBlock);
