import React, { Component } from 'react';
import client from './services-contentful';
import { shuffleArray} from './helpers';
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
      videos: [],
      video: null,
      videoPlayingIndex: null
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
      this.setState({
        programBlock: matchingBlock
      }, this.getProgramBlockVideos);
    } else {
      console.log('No matching program');
    }
  }

  getProgramBlockVideos = () => {
    this.fetchProgramBlock(this.state.programBlock.sys.id)
      .then(this.setVideos)
      .catch(error => this.setState({error}));
  }

  fetchProgramBlock = programBlockId => {
    return client.getEntry(programBlockId);
  };

  setVideos = response => {
    let videos = response.fields.videos;
    const showRandomVideos = this.state.programBlock.fields.isRandom;

    // Randomize order of videos if 'random' is set
    if (showRandomVideos) {
      console.log('Channel is random');
      videos = shuffleArray(videos);
    }
    // TODO: Save current location in video & timestamp when switching back and forth between channels
    // (To keep video 'counting up' as you switch between channels to play what's passed after that amount of time
    const videoToPlay = 0;

    this.setState({
      programBlock: response,
      videos: videos,
      video: videos[videoToPlay],
      videoPlayingIndex: videoToPlay
    }, () => {
      console.log("Selected video:", videos[videoToPlay]);
    });
  }

  onUpdateVideo = () => {
    console.log("State before updating video:", this.state);
    let newVideoToPlay = this.state.videoPlayingIndex + 1;
    console.log('Updating video to video #', newVideoToPlay, "of total", this.state.videos.length - 1);

    if (newVideoToPlay >= this.state.videos.length) {
      console.log("Going back to beginning");
      newVideoToPlay = 0;
    }

    console.log("New video to play:", this.state.videos[newVideoToPlay]);

    this.setState((state) => ({
      video: state.videos[newVideoToPlay],
      videoPlayingIndex: newVideoToPlay
    }));
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
            <Video
              video={this.state.video}
              onUpdateVideo={this.onUpdateVideo}
            />
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
