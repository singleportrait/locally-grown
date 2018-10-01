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
      playing: true,
      previouslyMuted: true
    }
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (this.props.video.sys.id !== prevProps.video.sys.id) {
      // console.log("Seeking to timestamp...");
      // this.player.seekTo(this.props.timestamp);
      console.log("Video: Video component did update");
      // console.log("Video previous state:", prevState);
      // Resetting the state to be muted FIXES the Vimeo pause issue,
      // but this doesn't fix turning muted back on once you switch
      // HOWEVER, somehow when switching back to Youtube from Vimeo
      // videos, the audio stays un-muted.
      // It ALSO breaks when a video plays into the next one,
      // if you've previously played with mute
      this.setState({
        volume: 0,
        muted: true,
        previouslyMuted: prevState.muted
      })
    }
  }

  onEnded = () => this.props.onUpdateVideo();

  onDuration = (duration) => {
    if (!this.state.duration) {
      // Had to put this here because onStart() doesn't reliably play
      // for Vimeo videos, and there's no other way to set the timestamp
      // But then, realized onDuration() only gets called once,
      // so we don't need to have this sanity check around it
      // this.seekToTimestamp(duration);
    }
    console.log("Video: Setting duration");
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
      console.log("Video: This timestamp is longer than the video!");
    }

    // console.log("Seeking to timestamp...");
    this.player.seekTo(this.props.timestamp);
  }

  playPause = () => {
    // Only playing/pausing the video via the button seems to
    // correctly trigger Vimeo videos to play/pause after
    // not playing by default after hitting 'Mute' button
    this.setState({ playing: !this.state.playing })
  }

  onPlay = () => {
    // Video loading animation will stop playing HERE
    // Ideally: Clicking 'next' won't actually switch the video until this
    // player loads
    // This doesn't reliably trigger for Vimeo videos
    console.log("Video: Playing...");
  }

  onReady = () => {
    // Was trying to get the videos to start playing by using a timeout
    // rather than user trigger, but didn't work
    // console.log("Video: On ready");
    // setTimeout(() => {
    //   this.playPause();
    //   setTimeout(this.playPause, 500);
    //   console.log("Video: Toggled play/pause");
    // }, 500)
    console.log("Video: onReady");
    if (!this.state.previouslyMuted) {
      console.log("This shouldn't be muted anymore");
      // Vimeo videos still pause when changing channels with
      // un-muted audio, though the following code could theoretically work
      // this.setState({
      //   volume: 1,
      //   muted: true
      // })
    }
  }

  toggleMute = () => {
    // Vimeo videos break once you try to unmute them
    // console.log("Video: Toggling mute");
    this.setState({
      volume: this.state.volume === 0 ? 1 : 0,
      muted: !this.state.muted,
      previouslyMuted: !this.state.muted
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
                onReady={this.onReady}
                onPlay={this.onPlay}
                onEnded={this.onEnded}
                onProgress={this.onProgress}
                onDuration={this.onDuration}
                width="100%"
                height="100%"
                className={reactPlayerStyle}
                config={{
                  youtube: {
                    playerVars: {
                      rel: 0
                    }
                  },
                  vimeo: {
                    playerOptions: {
                      background: 1
                    }
                  }
                }}
              />
            </ReactPlayerWrapper>
            <button onClick={this.playPause}>{this.state.playing ? 'Pause' : 'Play'}</button>
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
