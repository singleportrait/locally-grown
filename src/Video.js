import React, { Component } from 'react';

import styled, { css } from 'react-emotion';

// The react-player demo example
import { findDOMNode } from 'react-dom'

import ReactPlayer from 'react-player';
import screenfull from 'screenfull';

const ReactPlayerWrapper = styled('div')`
  position: relative;
  padding-top: 56.25%;
`;

const reactPlayerStyle = css`
  position: absolute;
  top: 0;
  left: 0;
`;

const progressStyle = css`
  background-color: #bbb;
`;

class Video extends Component {
  constructor(props) {
    super(props);

    this.state = {
      volume: 0,
      muted: true,
      playing: true
    }
  }

  componentDidUpdate = (prevProps) => {
    if (this.props.video.sys.id !== prevProps.video.sys.id) {
      // console.log("Seeking to timestamp...");
      // this.player.seekTo(this.props.timestamp);
      console.log("Video component did update");
    }
  }

  onEnded = () => this.props.onUpdateVideo();

  onDuration = (duration) => {
    console.log("duration being calculated", duration);
    if (!this.state.duration) {
      // console.log("Seeking...");
      // Had to put this here because onStart() doesn't reliably play
      // for Vimeo videos, and there's no other way to set the timestamp
      // this.seekToTimestamp(duration);
    }
    this.seekToTimestamp(duration);
    this.setState({
      duration: duration
    });
  }

  // This is only used for the progress bar
  onProgress = state => this.setState(state);

  seekToTimestamp = (duration) => {
    // TODO: Handle what should happen if the duration is greater than the
    // timestamp we passed in (could happen from user error)
    if (duration <= this.props.timestamp) {
      console.log("This timestamp is longer than the video!");
    }

    // console.log("Seeking to timestamp...");
    this.player.seekTo(this.props.timestamp);
  }

  toggleMute = () => {
    console.log("Toggling mute");
    this.setState({
      volume: this.state.volume === 0 ? 1 : 0,
      muted: !this.state.muted
    })
  }

  onClickFullscreen = () => {
    // The react-player demo example
    screenfull.request(findDOMNode(this.player));

    // The official React way (doesn't work immediately)
    // screenfull.request(this.player.current);
  }

  // The react-player demo example
  ref = player => {
    this.player = player;
  }

  render() {
    const videoFields = this.props.video.fields;

    return (
      <div>
        {this.props.video &&
          <div>
            <h3>{videoFields.title}</h3>
            <p>Video length: {videoFields.length}</p>
            <p>Length in seconds: {this.props.video.lengthInSeconds}</p>
            <p>Starting timestamp: {this.props.timestamp}</p>
            <ReactPlayerWrapper>
              <ReactPlayer
                ref={this.ref}
                url={videoFields.url}
                playing={this.state.playing}
                volume={this.state.volume}
                muted={this.state.muted}
                onEnded={this.onEnded}
                onProgress={this.onProgress}
                onDuration={this.onDuration}
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
            { this.state.duration && this.state.played &&
              <div className={progressStyle}>
                <p>Duration:</p>
                <br />
                <progress max={1} value={this.state.played} />
              </div>
            }
          </div>
        }
      </div>
    );
  }
}

Video.defaultProps = {
  timestamp: 0
}

export default Video;
