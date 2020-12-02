import React, { Component } from 'react';
import ReactPlayer from 'react-player';

import styled from '@emotion/styled';
import { css } from 'emotion';

import consoleLog from '../helpers/consoleLog';

import FullscreenPageButton from './FullscreenPageButton';
import MuteButton from './MuteButton';

import { VideoOverlay, ScreeningVideoDetails, ScreeningPreshowImage } from '../styles';

class HostedVideo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      muted: true,
      playing: false,
      videoEnded: false
    }
  }

  onReady = () => {
    consoleLog("The video is ready, let's seek (except this runs infinitely)");
  }

  /* Script to find out where to seek in the film */
  getSeekTime = () => {
    const now = new Date();
    const difference = (Date.parse(now) - Date.parse(this.props.liveTime))/1000;

    consoleLog("Time movie should start:", this.props.liveTime);
    consoleLog("Time it is now", now);
    consoleLog("Difference between the two:", difference);

    return difference;
  }

  onDuration = () => {
    consoleLog("The video has a duration, let's seek");
    consoleLog("Duration of movie?", this.player.getDuration());
    if (this.getSeekTime() > Math.round(this.player.getDuration())) {
      this.setState({
        videoEnded: true,
        playing: false
      });
      return;
    }

    this.player.seekTo(this.getSeekTime());
    this.setState({playing: true});
  }

  onEnded = () => {
    this.setState({
      videoEnded: true,
      playing: false
    });
  }

  toggleMute = () => {
    this.setState({muted: !this.state.muted});
  }

  ref = player => {
    this.player = player;
  }

  render() {
    return (
      <>
        <VideoWrapper>
          <VideoOverlay onClick={() => this.props.maxMode ? this.props.setMaxMode(false) : undefined} />
          { this.state.videoEnded && this.props.videoTrailerImage &&
            <ScreeningPreshowImage
              onClick={() => this.props.maxMode ? this.props.setMaxMode(false) : undefined}
              backgroundImage={`${this.props.videoTrailerImage.fields.file.url}?fm=jpg&fl=progressive`}
            />
          }
          <ReactPlayer
            ref={this.ref}
            url={this.props.registeredInfo.amazonS3Video}
            width="100%"
            height="100%"
            playing={this.state.playing}
            muted={this.state.muted}
            playsinline={true}
            className={reactPlayer}
            onReady={this.onReady}
            onEnded={this.onEnded}
            onDuration={this.onDuration}
            config={{
              youtube: {
                modestbranding: 1,
                rel: 0 // Doesn't work, sadly; could try something later
              }
            }}
          />
        </VideoWrapper>
        <ScreeningVideoDetails alignEnd={this.state.playing && !this.state.videoEnded}>
          { this.state.playing && !this.state.videoEnded &&
            <ControlsContainer>
              <FullscreenPageButton />
              <MuteButton muted={this.state.muted} toggleMute={this.toggleMute} />
            </ControlsContainer>
          }
          { this.state.videoEnded &&
            <small style={{color: "#999"}}>The film has ended. Thanks for joining us!</small>
          }
        </ScreeningVideoDetails>
      </>
    );
  }
}

const VideoWrapper = styled('div')`
  position: relative;
  padding-top: 56.25%;
  background-color: #000;
`;

const reactPlayer = css`
  position: absolute;
  top: 0;
  left: 0;
`;

const ControlsContainer = styled('div')`
  position: relative;
  margin-top: -.5rem;
  margin-right: -1rem;
  display: flex;
`;

export default HostedVideo;
