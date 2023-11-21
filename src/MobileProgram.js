import React from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';
import { css } from '@emotion/css';

import Video from './components/Video';
import MuteButton from './components/MuteButton';
import CloseIcon from './components/CloseIcon';
import ChannelButton from './components/ChannelButton';
import ProgramSidebar from './components/ProgramSidebar';
import TVGuideLink from './components/TVGuideLink';
import MailchimpSubscribeForm from './components/MailchimpSubscribeForm';
import BLMButton from './components/BLMButton';

import {
  Logo, brandColor, borderColor, VideoPlaceholderWrapper,
  mobileViewportHeight,
} from './styles';

function MobileProgram(props) {
  return (
    <React.Fragment>
      <MobileProgramContainer>
        { props.currentProgramBlock &&
          <Video
            video={props.currentProgramBlock.currentVideo}
            timestamp={props.currentProgramBlock.timestampToStartVideo}
            className={mobileVideo}
            isMobile={true}
          />
        }
        { (!props.currentProgramBlock || !props.currentProgramBlock.fields.videos) &&
          <VideoPlaceholderWrapper className={mobileVideo} isMobile={true} />
        }
      </MobileProgramContainer>
      <MobileProgramContainer>
        { props.currentProgramBlock &&
          <React.Fragment>
            { !props.showMobileProgramInfo &&
              <div className={mobileTopRightIcon}><MuteButton /></div>
            }
            { props.showMobileProgramInfo &&
              <div className={mobileProgramInfoCloseIcon} onClick={props.toggleMobileProgramInfo}>
                <CloseIcon />
              </div>
            }
            { props.previousChannelSlug && !props.showMobileProgramInfo &&
              <div className={mobilePreviousChannel}><ChannelButton direction="previous" to={props.previousChannelSlug} /></div>
            }
            { props.nextChannelSlug &&
              <div className={mobileNextChannel}><ChannelButton direction="next" to={props.nextChannelSlug} /></div>
            }
          </React.Fragment>
        }
      </MobileProgramContainer>
      <TopMobileText>
        <div>
          <Link to="/channels" className={css`text-decoration: none;`}><Logo>Locally Grown</Logo></Link>
          <p>
            You&apos;re watching {props.channelTitle}

            { props.channelContributor &&
              <span> by {props.channelContributor.fields.name}</span>
            }
          </p>
        </div>
        <TopMobileLinks>
          <TVGuideLink />
          <BLMButton small inline />
        </TopMobileLinks>
      </TopMobileText>
      { props.currentProgramBlock &&
        <BottomMobileText>
          <p>Now playing:</p>
          <ProgramBlockTitle onClick={props.toggleMobileProgramInfo}>
            {props.currentProgramBlock.fields.title}
            <span className={mobileInfo}>Info</span>
          </ProgramBlockTitle>
        </BottomMobileText>
      }
      { !props.currentProgramBlock &&
        <BottomMobileText>
          <ProgramBlockTitle>There&apos;s nothing playing on this channel right now.</ProgramBlockTitle>
        </BottomMobileText>
      }
      { props.showMobileProgramInfo &&
        <MobileProgramInfoContainer>
          <MobileProgramInfoContents>
            <MailchimpSubscribeForm />
            <hr />
            <ProgramSidebar
              currentProgramBlock={props.currentProgramBlock}
              programBlocks={props.programBlocks}
              currentHour={props.currentHour}
              channelTitle={props.channelTitle}
              channelSlug={props.channelSlug}
            ></ProgramSidebar>
          </MobileProgramInfoContents>
        </MobileProgramInfoContainer>
      }
    </React.Fragment>
  );
}

const MobileProgramContainer = styled('div')`
  transform: rotate(90deg);
  transform-origin: 50vw;
  width: ${mobileViewportHeight};
  height: 100vw;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Newer smartphones (e.g. Pixel, iPhone X) have a taller ratio than older ones.
// Therefore they can have wider videos than the squatter phones.
// Sample viewports, for reference, in Safari: iPhone 11 = 414x719, iPhone 8 = 375x553
const mobileVideoWidth = '90vw * 1.36';
const mobileShortVideoWidth = '90vw * 1.1';

// Because these overlaying containers go over the video anyway,
// we won't worry about updating their calculations for the shorter phones.
const mobileTextHeight = `calc((${mobileViewportHeight} - (${mobileVideoWidth})) / 2 - 1rem)`;
const mobileInfoContainerHeight = `calc((${mobileVideoWidth}) + ${mobileTextHeight} + 1rem)`;

const mobileVideo = css`
  width: calc(${mobileVideoWidth});

  // Target short phones
  @media (min-aspect-ratio: 3/5) {
    width: calc(${mobileShortVideoWidth});
  }
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
  width: calc(100vw - 130px);
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

const TopMobileLinks = styled('div')`
  margin-top: 0.5rem;
`;

const BottomMobileText = styled('div')`
  ${baseMobileText}
  bottom: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const ProgramBlockTitle = styled('h1')`
  font-size: 21px;
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
  background-color: ${brandColor};
`;

const MobileProgramInfoContents = styled('div')`
  border-top: 1px solid ${borderColor};
  height: ${mobileInfoContainerHeight};
  padding: 1rem 0;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
`;

export default MobileProgram;
