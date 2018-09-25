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
      programBlock: null, // {} ?
      videos: [],
      video: null, // {} ?
      videoPlayingIndex: null
    }
  }

  componentDidMount() {
    this.initializeProgramBlock();
  }

  componentDidUpdate = (prevProps) => {
    if (this.props.program.sys.id !== prevProps.program.sys.id) {
      console.log("New program selected");
      this.setCurrentProgramBlock();
    }
  }

  initializeProgramBlock() {
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
      // TODO: Do this as a caught error in action
      console.log('No matching program');
    }
  }

  // programBlockActions
  // fetchProgramBlock(this.props.programBlockId)
  // FETCH_PROGRAM_BLOCK
  getProgramBlockVideos = () => {
    this.fetchProgramBlock(this.state.programBlock.sys.id)
      .then(this.setVideos)
      .catch(error => this.setState({error}));
  }

  fetchProgramBlock = programBlockId => {
    return client.getEntry(programBlockId);
  };

  // videoActions
  // fetchProgramBlockVideos(this.props.programBlockId, 'content_type' = 'programBlock') #something
  // FETCH_PROGRAM_BLOCK_VIDEOS
  setVideos = response => {
    let videos = response.fields.videos;
    const showRandomVideos = this.state.currentProgramBlock.fields.isRandom;

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

  // videoActions
  // replaceVideo()
  // REPLACE_VIDEO
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
    const program = this.props.program;
    const { title, programBlocks } = program.fields;
    const video = program.currentProgramBlock.currentVideo;

    return (
      <div>
        The chosen program:
        <h4>You're watching {title}</h4>
        <p>Now playing:</p>
        { !program.currentProgramBlock &&
          <em>Nothing playing at this hour!</em>
        }
        { program.currentProgramBlock && video &&
          <div>
            <h1>{program.currentProgramBlock.fields.title}</h1>
            <Video
              video={video}
              onUpdateVideo={this.onUpdateVideo}
            />
          </div>
        }
        <h3>It's {this.props.currentHour} o'clock.</h3>

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
