import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled/macro';
import { css } from 'emotion/macro';
import consoleLog from './consoleLog';

import Video from './Video';
import MuteButton from './MuteButton';
import CloseIcon from './CloseIcon';
import ChannelButton from './ChannelButton';
import ProgramSidebar from './ProgramSidebar';
import TVGuideLink from './TVGuideLink';

import {
  Logo, backgroundColor, borderColor, VideoPlaceholderWrapper,
  mobileViewportHeight,
} from './styles';

let mobileViewportHeightX = (window.orientation === 0 ? window.innerHeight : window.innerWidth) + "px";
let mobileViewportWidthX = (window.orientation === 0 ? window.innerWidth : window.innerHeight) + "px";

class MobileProgram extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mobileViewportHeightX: (window.orientation === 0 ? window.innerHeight : window.innerWidth) + "px",
      mobileViewportWidthX: (window.orientation === 0 ? window.innerWidth : window.innerHeight) + "px",
    }
  }

  componentDidMount() {
    console.log("Orientation:", window.orientation === 0 ? "vertical" : "horizontal");
    consoleLog("Viewport size:", mobileViewportHeightX, mobileViewportWidthX);

    window.addEventListener('orientationchange', this.handleOrientationChange);

    window.addEventListener('scroll', this.handleOrientationChange);
  }

  componentWillUnmount() {
    window.removeEventListener('orientationchange', this.handleOrientationChange);
  }

  handleOrientationChange = (e) => {
    consoleLog("Orientation changed");
    consoleLog("Orientation:", window.orientation === 0 ? "vertical" : "horizontal");

    this.setState({
      mobileViewportHeightX: (window.orientation === 0 ? window.innerHeight : window.innerWidth) + "px",
      mobileViewportWidthX: (window.orientation === 0 ? window.innerWidth : window.innerHeight) + "px",
    });

    consoleLog("Viewport size:", this.state.mobileViewportHeightX, this.state.mobileViewportWidthX);
    // this.props.calculateWindowDimensions();
    // consoleLog(e);
    // consoleLog(window.screen.orientation);
  }

  render() {
    return (
      <React.Fragment>
        <MobileProgramContainer
          height={this.state.mobileViewportHeightX}
          width={this.state.mobileViewportWidthX}
        >
          { this.props.currentProgramBlock &&
            <Video
              video={this.props.currentProgramBlock.currentVideo}
              timestamp={this.props.currentProgramBlock.timestampToStartVideo}
              className={mobileVideo}
              isMobile={true}
            />
          }
          { (!this.props.currentProgramBlock || !this.props.currentProgramBlock.fields.videos) &&
            <VideoPlaceholderWrapper className={mobileVideo} isMobile={true} />
          }
        </MobileProgramContainer>
        <MobileProgramContainer
          height={this.state.mobileViewportHeightX}
          width={this.state.mobileViewportWidthX}
        >
          { this.props.currentProgramBlock &&
            <React.Fragment>
              { !this.props.showMobileProgramInfo &&
                <div className={mobileTopRightIcon}><MuteButton /></div>
              }
              { this.props.showMobileProgramInfo &&
                <div className={mobileProgramInfoCloseIcon} onClick={this.props.toggleMobileProgramInfo}>
                  <CloseIcon />
                </div>
              }
              { this.props.previousChannelSlug && !this.props.showMobileProgramInfo &&
                <div className={mobilePreviousChannel}><ChannelButton direction="previous" to={this.props.previousChannelSlug} /></div>
              }
              { this.props.nextChannelSlug &&
                <div className={mobileNextChannel}><ChannelButton direction="next" to={this.props.nextChannelSlug} /></div>
              }
            </React.Fragment>
          }
        </MobileProgramContainer>
        <TopMobileText>
          <div>
            <Link to="/channels" className={css`text-decoration: none;`}><Logo>Locally Grown</Logo></Link>
            <p>
              You&apos;re watching {this.props.channelTitle}

              { this.props.channelUser &&
                <span> by {this.props.channelUser.fields.name}</span>
              }
            </p>
          </div>
          <TVGuideLink />
        </TopMobileText>
        { this.props.currentProgramBlock &&
          <BottomMobileText>
            <p>Now playing:</p>
            <h1 onClick={this.props.toggleMobileProgramInfo}>{this.props.currentProgramBlock.fields.title}<span className={mobileInfo}>Info</span></h1>
          </BottomMobileText>
        }
        { !this.props.currentProgramBlock &&
          <BottomMobileText>
            <h1>There&apos;s nothing playing on this channel right now.</h1>
          </BottomMobileText>
        }
        { this.props.showMobileProgramInfo &&
          <MobileProgramInfoContainer>
            <MobileProgramInfoContents>
              <ProgramSidebar
                currentProgramBlock={this.props.currentProgramBlock}
                programBlocks={this.props.programBlocks}
                currentHour={this.props.currentHour}
                channelTitle={this.props.channelTitle}
                channelSlug={this.props.channelSlug}
              ></ProgramSidebar>
            </MobileProgramInfoContents>
          </MobileProgramInfoContainer>
        }
      </React.Fragment>
    );
  }
}

const MobileProgramContainer = styled('div')`
  transform: rotate(90deg);
  // transform-origin: 50vw;
  // transform-origin: 50vw;
  // width: ${mobileViewportHeight};
  // height: 100vw;
  // width: ${mobileViewportHeightX};
  // height: ${mobileViewportWidthX};
  // transform-origin: calc(${mobileViewportWidthX} / 2);
  width: ${props => props.height};
  height: ${props => props.width};
  transform-origin: calc(${props => props.width} / 2);
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// const mobileTextHeight = `calc((${mobileViewportHeightX} - (${mobileVideoWidth})) / 2 - 1rem)`;
// const mobileVideoWidth = '90vw * 1.33';
const mobileVideoWidth = `(${mobileViewportWidthX} * .9) * 1.33`;
const mobileTextHeight = `calc((${mobileViewportHeightX} - (${mobileVideoWidth})) / 2 - 1rem)`;
const mobileInfoContainerHeight = `calc((${mobileVideoWidth}) + ${mobileTextHeight} + 1rem)`;

const mobileVideo = css`
  width: calc(${mobileVideoWidth});
`;

const mobileTopRightIcon = css`
  position: absolute;
  top: 0;
  left: 0;
`;

const mobileProgramInfoCloseIcon = css`
  ${mobileTopRightIcon}
  padding: 1rem;
`;

const mobilePreviousChannel = css`
  position: absolute;
  bottom: 0;
  left: 1rem;
`;

const mobileNextChannel = css`
  position: absolute;
  bottom: 0;
  right: 1rem;
`;

const baseMobileText = `
  position: absolute;
  width: calc(${mobileViewportWidthX} - 130px);
  left: 75px;
  height: ${mobileTextHeight};
`;

const TopMobileText = styled('div')`
  ${baseMobileText}
  top: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-bottom: 1rem;
`;

const BottomMobileText = styled('div')`
  ${baseMobileText}
  bottom: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const mobileInfo = css`
  font-size: 12px;
  font-weight: 300;
  text-decoration: underline;
  padding-left: 5px;
`;

const MobileProgramInfoContainer = styled('div')`
  position: absolute;
  padding: 0 1rem;
  width: 100%;
  height: ${mobileInfoContainerHeight};
  top: calc(${mobileTextHeight} + 1rem);
  background-color: ${backgroundColor};
`;

const MobileProgramInfoContents = styled('div')`
  border-top: 1px solid ${borderColor};
  height: ${mobileInfoContainerHeight};
  padding: 1rem 0;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
`;

export default MobileProgram;
