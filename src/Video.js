import React, { Component } from 'react';
import { connect } from 'react-redux';
import { updateCurrentVideo } from './operations/programBlockOperations';
import { addVideoPlayer, toggleMute } from './actions/videoActions';

import ReactPlayer from 'react-player';

import styled, { css } from 'react-emotion';

class Video extends Component {
  constructor(props) {
    super(props);

    this.state = {
      playing: true
    }
  }

  componentDidMount = () => this.props.addVideoPlayer(this.player);

  componentDidUpdate = (prevProps, prevState) => {
    if (this.props.video.sys.id !== prevProps.video.sys.id) {
      // Resetting the state to be muted FIXES the Vimeo pause issue,
      // but this doesn't fix turning muted back on once you switch
      // HOWEVER, somehow when switching back to Youtube from Vimeo
      // videos, the audio stays un-muted.
      // It ALSO breaks when a video plays into the next one,
      // if you've previously played with mute
      // For now: Only reset the mute settings if the video is Vimeo
      if (this.props.video.fields.url.indexOf("vimeo") !== -1 && !this.props.videoStore.muted) {
        this.props.toggleMute(false);
      }
    }

    if (this.props.video.index !== prevProps.video.index &&
      this.props.video.fields.url === prevProps.video.fields.url) {
      // console.log("- The new video is the same as the old one, but the index has changed. Let's restart the video");
      this.onDuration();
    }
  }

  onEnded = () => this.props.updateCurrentVideo();

  onDuration = (duration) => {
    if (!this.state.duration) {
      // Had to put this here because onStart() doesn't reliably play
      // for Vimeo videos, and there's no other way to set the timestamp
      // But then, realized onDuration() only gets called once,
      // so we don't need to have this sanity check around it
      // this.seekToTimestamp(duration);
    }
    // console.log("Video: Setting duration");
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
    //
    this.setState({ playing: !this.state.playing })
  }

  onPlay = () => {
    // Video loading animation stops playing HERE
    // Ideally: Clicking 'next' won't actually switch the video until this
    // player loads
    // This doesn't reliably trigger for Vimeo videos
    // console.log("Video: Playing...");
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
    // console.log("Video: onReady");
    // if (!this.state.previouslyMuted) {
      // console.log("This shouldn't be muted anymore");
      // Vimeo videos still pause when changing channels with
      // un-muted audio, though the following code could theoretically work
      // this.setState({
      //   volume: 1,
      //   muted: true
      // })
    // }
  }

  toggleMute = () => {
    // Vimeo videos break once you try to unmute the videos and change the channel
    // console.log("Video: Toggling mute");
    this.props.toggleMute(this.props.videoStore.muted);
  }

  // The react-player demo example
  ref = player => {
    this.player = player;
  }

  render() {
    const videoFields = this.props.video.fields;

    return (
      <React.Fragment>
        {this.props.video &&
          <React.Fragment>
            <ReactPlayerWrapper className={this.props.className} cropControls={this.props.cropControls}>
              <VideoOverlay />
              <ReactPlayer
                ref={this.ref}
                url={videoFields.url}
                playing={this.state.playing}
                volume={this.props.videoStore.volume}
                muted={this.props.videoStore.muted}
                onReady={this.onReady}
                onPlay={this.onPlay}
                onEnded={this.onEnded}
                onProgress={this.onProgress}
                onDuration={this.onDuration}
                width="100%"
                height={this.props.cropControls ? "140%" : "100%"}
                className={this.props.cropControls ? croppedReactPlayerStyle : reactPlayerStyle}
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

            { this.props.showMetadata &&
              <div>
                <h3>Metadata:</h3>
                Title: {videoFields.title}
                <br />
                Video length: {videoFields.length || "No length set"}
                &nbsp;
                ({`${this.props.video.lengthInSeconds} seconds` || "No length set"})
                <br />
                Starting timestamp: {this.props.timestamp}

                <br />
                <br />

                <button onClick={this.playPause}>{this.state.playing ? 'Pause' : 'Play'}</button>
              </div>
            }
            { this.props.showMetadata && this.state.duration && this.state.played &&
              <div>
                <p>Duration:</p>
                <br />
                <progress className={progressStyle} max={1} value={this.state.played} />
              </div>
            }
          </React.Fragment>
        }
      </React.Fragment>
    );
  }
}

const ReactPlayerWrapper = styled('div')`
  position: relative;
  padding-top: 75%;
  background-color: #222;
  ${props => props.cropControls && 'overflow: hidden;'}
`;

const reactPlayerStyle = css`
  position: absolute;
  top: 0;
  left: 0;
`;

const croppedReactPlayerStyle = css`
  position: absolute;
  top: 0;
  left: 0;
  top: -20%;
`;

const VideoOverlay = styled('div')`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
`;

const progressStyle = css`
  background-color: white;
`;

Video.defaultProps = {
  timestamp: 0
}

const mapStateToProps = state => ({
  videoStore: state.video
});

export default connect(mapStateToProps, { updateCurrentVideo, toggleMute, addVideoPlayer })(Video);
