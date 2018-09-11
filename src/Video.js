import React, { Component } from 'react';
import styled, { css } from 'react-emotion';

// The react-player demo example
import { findDOMNode } from 'react-dom'

import ReactPlayer from 'react-player';
import screenfull from 'screenfull';
import client from './services-contentful';

const ReactPlayerWrapper = styled('div')`
  position: relative;
  padding-top: 56.25%;
`;

const reactPlayerStyle = css`
  position: absolute;
  top: 0;
  left: 0;
`;

class Video extends Component {
  constructor(props) {
    super(props);

    // The official React way
    //this.player = React.createRef();

    this.state = {
      programBlock: [],
      muted: true
    }

    this.toggleMute = this.toggleMute.bind(this);
  }

  componentDidMount() {
    this.fetchVideo(this.props.programBlockId).then(this.setVideo);

    //console.log('Player:', this.player.current);
  }

  fetchVideo = programBlockId => {
    return client.getEntry(programBlockId);
  };

  setVideo = response => {
    console.log("videos", response.fields.videos);
    // TODO: Create random() helper function
    const videoToPlay = this.props.random ? Math.floor(Math.random() * response.fields.videos.length) : 0;
    this.setState({
      programBlock: response,
      video: response.fields.videos[videoToPlay]
    });

    //console.log(this.state.video.fields);
  }

  onReady() {
    console.log('Video is ready to play');
  }

  toggleMute() {
    this.setState({
      muted: !this.state.muted
    })
  }

  // TODO: Why are function sometimes like this and sometimes like:
  // onClickFullscreen() { ... }
  // IN FACT =>> this.player didn't work with () but works with () =>
  onClickFullscreen = () => {
    // The react-player demo example
    screenfull.request(findDOMNode(this.player));
    console.log('Player', this.player);

    // The official React way (doesn't work immediately)
    // screenfull.request(this.player);
    //
    // Or maybe,
    // screenfull.request(this.player.current);
  }

  // The react-player demo example
  ref = player => {
    this.player = player;
  }

  render() {
    return (
      <div>
        Here is my video.
        {this.state.video &&
          <div>
            <div>{this.state.video.fields.title}</div>
            <ReactPlayerWrapper>
              <ReactPlayer
                ref={this.ref}
                url={this.state.video.fields.url}
                playing
                muted={this.state.muted}
                onReady={this.onReady}
                width="100%"
                height="100%"
                className={reactPlayerStyle}
                config={{
                  vimeo: {
                    playerOptions: {
                      background: 1
                    }
                  }
                }}
              />
            </ReactPlayerWrapper>
            <button onClick={this.toggleMute}>Toggle mute</button>
            <button onClick={this.onClickFullscreen}>Fullscreen</button>
          </div>
        }
      </div>
    );
  }
}

export default Video;
