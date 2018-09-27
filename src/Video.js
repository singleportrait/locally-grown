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

class Video extends Component {
  constructor(props) {
    super(props);

    // The official React way; doesn't work
    //this.player = React.createRef();

    this.state = {
      muted: true
    }
  }

  onReady = () => {
    console.log('Video is ready to play');
  }

  onEnded = () => {
    console.log("Video completed");
    this.props.onUpdateVideo();
  }

  onDuration = (duration) => {
    if (!this.state.duration) {
      // Had to put this here because onStart() doesn't reliably play
      // for Vimeo videos, and there's no other way to set the timestamp
      this.seekToTimestamp();
    }
    this.setState({
      duration: duration
    });
  }

  seekToTimestamp = () => {
    // TODO: Check to make sure the duration is greater than the
    // second we're seeking to
    this.player.seekTo(this.props.timestamp);
    console.log(this.player);
  }

  toggleMute = () => {
    this.setState({
      muted: !this.state.muted
    })
  }

  // TODO: Why are function sometimes like this and sometimes like:
  onClickFullscreen = () => {
    // The react-player demo example
    screenfull.request(findDOMNode(this.player));
    // console.log('Player', this.player);

    // The official React way (doesn't work immediately)
    // screenfull.request(this.player.current);
  }

  // The react-player demo example
  ref = player => {
    this.player = player;
  }

  render() {
    return (
      <div>
        {this.props.video &&
          <div>
            <div>{this.props.video.fields.title}</div>
            <ReactPlayerWrapper>
              <ReactPlayer
                ref={this.ref}
                url={this.props.video.fields.url}
                playing
                muted={this.state.muted}
                onReady={this.onReady}
                onEnded={this.onEnded}
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
