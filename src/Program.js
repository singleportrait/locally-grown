import React, { Component } from 'react';
import client from './services-contentful';
import Video from './Video';

class Program extends Component {
  /* Things to do here:
   * - Find the program block for the current hour
   * - If the hour is random, pick a video at random and start the video
   *   at a random time within it
   * - If the hour is not random, calculate which video should play and
   *   what timestamp it should start at
   */

  constructor(props) {
    super(props);

    this.state = {
      currentHour: new Date().getHours(),
      programBlock: null,
      video: null
    }
  }

  componentDidMount() {
    this.setCurrentProgramBlock();
  }

  componentDidUpdate = (prevProps) => {
    if (this.props.program.sys.id !== prevProps.program.sys.id) {
      console.log("New program selected");
      this.setCurrentProgramBlock();
    }
  }

  setCurrentProgramBlock() {
    const matchingBlock = this.props.program.fields.programBlocks.find(programBlock => {
      // console.log("Found program hour vs. current hour:", programBlock.fields.startTime, this.state.currentHour);
      // TODO: Lift up `currentHour` out of this component and pass in as a prop
      // because we've already calculated that and which program block to play
      // in the App component
      return programBlock.fields.startTime === this.state.currentHour;
    });

    if (matchingBlock) {
      console.log('Program Block videos:', matchingBlock.fields.videos);

      this.setState({
        programBlock: matchingBlock
      }, this.getActiveVideo);
    } else {
      console.log('No matching program');
    }
  }

  getActiveVideo = () => {
    this.fetchVideo(this.state.programBlock.sys.id)
      .then(this.setVideo)
      .catch(error => this.setState({error}));
  }

  fetchVideo = programBlockId => {
    return client.getEntry(programBlockId);
  };

  setVideo = response => {
    // TODO: Create random() helper function
    // TODO: Save the randomized order of this and keep it in the right order
    // & add latest timestamp when switching back and forth between channels
    const videoToPlay = this.state.programBlock.fields.isRandom ? Math.floor(Math.random() * response.fields.videos.length) : 0;

    this.setState({
      programBlock: response,
      video: response.fields.videos[videoToPlay]
    }, () => {
      console.log("Selected video:", response.fields.videos[videoToPlay]);
    });
  }

  render() {
    const { title, programBlocks } = this.props.program.fields;

    return (
      <div>
        The chosen program:
        <h4>You're watching {title}</h4>
        <p>Now playing:</p>
        { !this.state.programBlock &&
          <div>
            <em>Nothing playing!</em>
          </div>
        }
        { this.state.programBlock && this.state.video &&
          <div>
            <h1>{this.state.programBlock.fields.title}</h1>
            <Video video={this.state.video} />
          </div>
        }
        <h3>It's {this.state.currentHour} o'clock.</h3>

        { programBlocks.map(({fields}, i) =>
          <div key={i}>
            {fields.startTime}:00 - {fields.title}
          </div>
        )}


      </div>
    );
  }
}

export default Program;
