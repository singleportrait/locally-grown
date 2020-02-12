import React, { Component } from 'react';
import { connect } from 'react-redux';
import consoleLog from './consoleLog';
import ReactGA from 'react-ga';

import { updateCurrentVideo } from './operations/programBlockOperations';
import { addVideoPlayer, toggleMute } from './actions/videoActions';

import ReactPlayer from 'react-player';

import { videoBackgroundColor } from './styles';

import styled from '@emotion/styled';
import { css } from 'emotion';

class Video extends Component {
  constructor(props) {
    super(props);

    this.state = {
      playing: true,
      error: false,
      // url: null,
    }
  }

  componentDidMount = () => {
    this.props.addVideoPlayer(this.player);

    // consoleLog("- Mounting video", this.props.video.fields.url);

    // Using this fixed the console error, but doesn't update the video correctly the first time you switch channels
    // Error: "ReactPlayer: the attempt to load <URL> is being deferred until the player has loaded"
    // Reference react-player issue & fix: https://github.com/CookPete/react-player/issues/413
    // Might need to move the video fields to the Redux store to get it working correctly
    // this.setState({
    //   url: this.props.video.fields.url
    // })
  }

  componentDidUpdate = (prevProps, prevState) => {
    // consoleLog("- Timestamp to start:" + this.props.timestamp);
    // consoleLog("- Updating component");
    if (this.props.video.sys.id !== prevProps.video.sys.id) {
      // consoleLog("- New video will play");
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
      // Using this (in combination with setState when mounting, above) brought back the console error the above approach fixed
      // this.setState({
      //   url: this.props.video.fields.url
      // })
    }

    if (this.props.video.index !== prevProps.video.index &&
      this.props.video.fields.url === prevProps.video.fields.url) {
      // consoleLog("- The new video is the same as the old one, but the index has changed. Let's restart the video");
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
    // consoleLog("- Video: Setting duration");
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
      consoleLog("Video: This timestamp is longer than the video!");
    }

    // consoleLog("- Seeking to timestamp...");
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
    // consoleLog("- Video: Playing...");
  }

  onReady = () => {
    // Was trying to get the videos to start playing by using a timeout
    // rather than user trigger, but didn't work
    // consoleLog("- Video: On ready");
    // setTimeout(() => {
    //   this.playPause();
    //   setTimeout(this.playPause, 500);
    //   consoleLog("- Video: Toggled play/pause");
    // }, 500)
    // consoleLog("- Video: onReady");
    // if (!this.state.previouslyMuted) {
      // consoleLog("- This shouldn't be muted anymore");
      // Vimeo videos still pause when changing channels with
      // un-muted audio, though the following code could theoretically work
      // this.setState({
      //   volume: 1,
      //   muted: true
      // })
    // }
  }

  onError = (e) => {
    // consoleLog("- Video errored", e); // Can pass `e` in if you like

    this.setState({ error: true });

    const category = "Video Error";
    let action = undefined;
    const label = this.props.video.fields.title + ": " + this.props.video.fields.url;

    const error404Regex = /was not found/g;
    const errorUnembeddableRegex = /150/g;

    if (error404Regex.test(e)) {
      action = "404 Error: Not found";
    } else if (errorUnembeddableRegex.test(e)) {
      action = "150 Error: Not Embeddable";
    } else {
      action = "Reason Unknown";
    }

    // consoleLog(category);
    // consoleLog(action);
    // consoleLog(label);
    ReactGA.event({
      category: category,
      action: action,
      label: label,
      nonInteraction: true
    });
  }

  toggleMute = () => {
    // Vimeo videos break once you try to unmute the videos and change the channel
    // consoleLog("Video: Toggling mute");
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
            <ReactPlayerWrapper
              className={this.props.className}
              isMobile={this.props.isMobile}
            >
              <VideoOverlay
                error={this.state.error}
              >
                { this.state.error &&
                  <React.Fragment>
                    <h1>Video Error</h1>
                    <ErrorMessage>Err...something's not working with this video. Try again, or try another channel. We're working on it.</ErrorMessage>
                  </React.Fragment>
                }
              </VideoOverlay>
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
                onError={this.onError}
                width="100%"
                height="140%"
                className={reactPlayerStyle}
                style={{
                  opacity: this.state.error ? "0" : "1"
                }}
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
  background-color: ${videoBackgroundColor};
  overflow: hidden;
  padding-top: ${props => props.isMobile ? '50%' : '75%'};
`;

const VideoOverlay = styled('div')`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  transition: opacity .3s ease;
  background-size: contain;

  // For some reason, simply setting the z-index on this higher than the
  // sibling element (containing the iframe) still showed the video on top.
  // Maybe it has something to do with the CSS 'transform' on the parent element,
  // but seems more likely to have something to do with the stack context of the
  // iframe itself. For this reason, the cleanest way to stack this "over" the
  // video is to set the video's opacity to zero in cases when the error overlay should be showing.
  // This isn't ideal, and if we wanted to add any interactions within this overlay
  // we'd have to find another approach (also considering, on mobile, this video
  // element is already overlaid with other elements on the page.
  // But, for the time being this works. Phew!
  ${props => props.error && "background-image: url(./static_placeholder_simpler.gif);"};
  opacity: ${props => props.error ? "1" : "0"};
`;

const ErrorMessage = styled('h3')`
  max-width: 430px;

  @media screen and (max-width: 600px) {
    max-width: 320px;
  }
`;

const reactPlayerStyle = css`
  position: absolute;
  left: 0;
  top: -20%;
`;

const progressStyle = css`
  background-color: white;
`;

Video.defaultProps = {
  timestamp: 0,
  isMobile: false,
}

const mapStateToProps = state => ({
  videoStore: state.video
});

export default connect(mapStateToProps, { updateCurrentVideo, toggleMute, addVideoPlayer })(Video);
