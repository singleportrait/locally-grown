import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import MediaQuery from 'react-responsive';
import debounce from 'lodash/debounce';
import consoleLog from './helpers/consoleLog';

import styled from '@emotion/styled';
import { css } from 'emotion';

import { getCurrentProgramBlock } from './operations/programBlockOperations';

import MobileProgram from './MobileProgram';

import LoadingScreen from './components/LoadingScreen';
import Video from './components/Video';
import Navigation from './components/Navigation';
import MuteButton from './components/MuteButton';
import ChannelButton from './components/ChannelButton';
import InfoTooltip from './components/InfoTooltip';
import ProgramSidebar from './components/ProgramSidebar';
import KeyboardNavigation from './components/KeyboardNavigation';
import MailchimpSubscribeForm from './components/MailchimpSubscribeForm';
import BLMButton from './components/BLMButton';

import {
  VideoPlaceholderWrapper,
} from './styles';

function Program(props) {
  const dispatch = useDispatch();
  const session = useSelector(state => state.session);
  const reduxProgramBlocks = useSelector(state => state.programBlocks);

  const currentProgramBlock = reduxProgramBlocks.currentProgramBlock;
  const { programBlocks } = props.program.fields;

  /* Remove loading state once Redux's program blocks are loaded */
  const [isLoaded, setIsLoaded] = useState(reduxProgramBlocks.isLoaded);
  useEffect(() => {
    // console.log("Redux program blocks are changing; loaded is: ", reduxProgramBlocks.isLoaded);
    setIsLoaded(reduxProgramBlocks.isLoaded);
  }, [reduxProgramBlocks.isLoaded]);

  /* Initialize program on mount and when hour changes */
  const prevCurrentHourRef = useRef();
  useEffect(() => {
    // console.log("[Running initialize useEffect]");
    // console.log("- Redux program blocks", reduxProgramBlocks);
    const initializeProgram = () => {
      // Note: This will allow you to come to a direct URL and see that there are
      // no programs for the current moment.
      // console.log("[Running initializeProgram]");
      if (programBlocks) {
        const currentProgramBlock = programBlocks.find(programBlock => {
          return programBlock.fields.startTime === session.currentHour;
        })

        if (currentProgramBlock) {
          consoleLog("Getting current program block in initializeProgram");
          dispatch(getCurrentProgramBlock(currentProgramBlock.sys.id));
        } else {
          consoleLog("No current program block!");
          dispatch(getCurrentProgramBlock(null));
        }
      } else {
        consoleLog("No program blocks!");
        dispatch(getCurrentProgramBlock(null));
      }
    }

    const prevCurrentHour = prevCurrentHourRef.current;
    prevCurrentHourRef.current = session.currentHour;

    // console.log("Previous hour:", prevCurrentHour, "Current hour: ", session.currentHour);
    if (!prevCurrentHour || session.currentHour !== prevCurrentHour) {
      // console.log("- Only run me on component mount or on current hour update");
      // console.log("- Session hour:", session.currentHour);
      // console.log("- Program blocks:", programBlocks);
      initializeProgram();
    }
  }, [session.currentHour, programBlocks, dispatch]);

  /* Event handlers for mouse move and max mode */
  const [maxMode, setMaxMode] = useState(false);
  const [inputIsFocused, setInputIsFocused] = useState(false);

  const handleEventEnd = useCallback(debounce((e) => {
    if (!inputIsFocused) {
      consoleLog('Starting max mode after 3s debounce');
      setMaxMode(true);
    } else {
      consoleLog('Not starting max mode because input is focused');
    }
  }, 3000, {
    'leading': false,
    'trailing': true
  }), [inputIsFocused, setMaxMode]);

  const handleEventStart = useCallback(debounce((e) => {
    consoleLog('Preventing or removing max mode');
    setMaxMode(false);
  }, 1000, {
    'leading': true,
    'trailing': false
  }), [setMaxMode]);

  const handleEvents = useCallback(() => {
    handleEventStart();
    handleEventEnd();
  }, [handleEventStart, handleEventEnd]);

  /* Event listeners for mouse move and max mode */
  useEffect(() => {
    // console.log("[Adding mouse move event listeners]");
    document.addEventListener('mousemove', handleEvents);

    return () => {
      // console.log("[Removing mouse move event listeners]");
      document.removeEventListener('mousemove', handleEvents);
      handleEventEnd.cancel(); // Lodash's debounce-removing tool
    }
  }, [handleEvents, handleEventEnd]);

  const preventMaxMode = () => {
    consoleLog("Input is focused");
    setInputIsFocused(true);
  }

  const stopPreventingMaxMode = () => {
    consoleLog("Input is blurred");
    setInputIsFocused(false);
  }

  /* Event listener for mobile device rotating */
  /* This handles when mobile gets rotated twice. For some reason, <MediaQuery>
   * stops detecting properly, even though the window's size appears correctly.
   * So, we detect the rotation manually, wait for the resize to be complete,
   * and then overwrite the initial window viewport size. Then, we use that new
   * size to handle whether to show the mobile program section or not.
   *
   * We only run the resize event once, so that we're not then constantly polling
   * if the user scrolls, etc. The caveat here is that, when using Chrome
   * and the inspector, we don't generally listen for resizes, so if you're
   * switching between responsive mode and desktop mode, it's not going to
   * behave correctly. Just refresh the browser, and you'll be fine. That's
   * simpler than adding custom code just for test situations.
   *
   * This doesn't work entirely perfect on mobile Chrome. There are times
   * (probably because of the timeout) that it doesn't trigger correctly.
   * However, since the resize event doesn't trigger reliably when rotating
   * horizontally, I'm choosing not to run on both events for the time being.
   *
   * We could choose to also use the `resize` window event similarly, if we
   * want to add a backup for if this doesn't fire consistently enough, with
   * the downside that it could cause a performance lag with running both of
   * these all the time
   *
   * Some phone sizes for reference:
   * iPhone = 375 x 667
   * iPhone XL = 414 x 736
   * Pixel = 411 x 731
   * Pixel XL = 411 x 823
   */
  /* When orientationchange gets run:
   * For all mobile browsers tested: immediately after rotation
   *
   * When resize gets run:
   * Mobile iOS Safari: immediately after orientationchange but *only when rotating from horizontal to vertical*
   * Mobile (Android) Chrome: immediately after orientation when rotating both directions
   */
  const [viewportWidth, setViewportWidth] = useState(window.visualViewport.width);
  const [viewportHeight, setViewportHeight] = useState(window.visualViewport.height);
  useEffect(() => {
    // console.log("[Adding useEffect for device rotation]");
    const handleOrientationChange = (e) => {
      // consoleLog("- Orientation changed; sizes now:", window.innerWidth, window.innerHeight);

      const handleResizeOnOrientation = () => {
        setViewportWidth(window.visualViewport.width);
        setViewportHeight(window.visualViewport.height);

        // consoleLog("- After orientation timeout, window size now:", this.state.viewportWidth, this.state.viewportHeight);
      }

      /* Different browsers trigger the resize differently (e.g. Safari
       * triggers one instantly, but Chrome never does until scroll), so we'll
       * depend on a timeout :'( and check the viewport size ourselves.
       * Works just nicely in Safari, is a little flickery in Chrome, but at
       * least it doesn't completely break. */
      setTimeout(handleResizeOnOrientation, 150);
    }

    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      // console.log("[Removing useEffect for device rotation]");
      window.removeEventListener('orientationchange', handleOrientationChange);
    }
  }, [viewportWidth, viewportHeight]);

  const [showMobileProgramInfo, setShowMobileProgramInfo] = useState(false);
  const toggleMobileProgramInfo = () => {
    setShowMobileProgramInfo(!showMobileProgramInfo);
  }

  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const toggleInfo = () => {
    setShowInfoTooltip(!showInfoTooltip);
  }

  const renderDesktopVideo = (allowMaxMode = true) => {
    return (
      <React.Fragment>
        { currentProgramBlock && currentProgramBlock.fields.videos &&
          <Video
            video={currentProgramBlock.currentVideo}
            timestamp={currentProgramBlock.timestampToStartVideo}
          />
        }
        { (!currentProgramBlock || !currentProgramBlock.fields.videos) &&
            <VideoPlaceholderWrapper />
        }

        { currentProgramBlock &&
          <VideoControls hasMultipleChannels={props.previousChannelSlug} maxMode={allowMaxMode && maxMode}>
            { props.previousChannelSlug &&
                <ChannelButton direction="previous" to={props.previousChannelSlug} />
            }

            { currentProgramBlock.fields.videos &&
              <div className={controlButtons}>
                <MuteButton />
              </div>
            }

            { props.nextChannelSlug &&
                <ChannelButton direction="next" to={props.nextChannelSlug} />
            }
          </VideoControls>
        }
      </React.Fragment>
    );
  }

  const renderChannelInfo = () => {
    return (
      <React.Fragment>
        <MailchimpSubscribeForm
          preventMaxMode={preventMaxMode}
          stopPreventingMaxMode={stopPreventingMaxMode} />
        <BLMButton />
        <hr />
        <Navigation />
        <p className={channelTitle}>
          You&apos;re watching {props.channelTitle}

          { props.channelContributor &&
              <span> by {props.channelContributor.fields.name}</span>
          }
          .
          <InfoTooltip
            toggleInfo={toggleInfo}
            show={showInfoTooltip}
            title={props.program.fields.displayTitle || props.program.fields.title}
            description={props.program.fields.description}
            contributor={props.channelContributor}
          />
        </p>
        <hr />
      </React.Fragment>
    );
  }

  const renderSidebarProgramContent = () => {
    return (
      <ProgramSidebar
        currentProgramBlock={currentProgramBlock}
        programBlocks={programBlocks}
        currentHour={session.currentHour}
        channelTitle={props.channelTitle}
        channelSlug={props.channelSlug}
      ></ProgramSidebar>
    );
  }

  return (
    <React.Fragment>
      { !isLoaded &&
        <LoadingScreen showInitialLoadingState />
      }
      { isLoaded &&
        <>
          <KeyboardNavigation
            previousChannelSlug={props.previousChannelSlug}
            nextChannelSlug={props.nextChannelSlug}
            preventNavigation={inputIsFocused}
          />
          <MediaQuery minWidth={800}>
            <WideProgramContainer>
              <VideoAndControlsColumn maxMode={maxMode}>
                { renderDesktopVideo() }
              </VideoAndControlsColumn>
              <InfoColumnContainer maxMode={maxMode} onScroll={handleEvents}>
                <div className={infoColumn}>
                  { renderChannelInfo() }
                  { renderSidebarProgramContent() }
                </div>
              </InfoColumnContainer>
            </WideProgramContainer>
          </MediaQuery>
          <MediaQuery minWidth={415} maxWidth={800}>
            <MediumProgramContainer>
              { renderChannelInfo() }
              <MediumVideoContainer>
                { renderDesktopVideo(false) }
              </MediumVideoContainer>
              { renderSidebarProgramContent() }
            </MediumProgramContainer>
          </MediaQuery>
          { viewportWidth <= 767 && viewportHeight >= 415 &&
            <MobileProgram
              currentProgramBlock={currentProgramBlock}
              programBlocks={programBlocks}
              showMobileProgramInfo={showMobileProgramInfo}
              toggleMobileProgramInfo={toggleMobileProgramInfo}
              previousChannelSlug={props.previousChannelSlug}
              nextChannelSlug={props.nextChannelSlug}
              channelTitle={props.channelTitle}
              channelContributor={props.channelContributor}
              currentHour={session.currentHour}
            ></MobileProgram>
          }
        </>
      }
    </React.Fragment>
  );
  // }
}

const WideProgramContainer = styled('div')`
  display: flex;
  margin: 1.4rem 1.4rem 0;
  position: relative;
  overflow: hidden;
  height: calc(100vh - 1.4rem);
`;

const MediumProgramContainer = styled('div')`
  margin: 1.4rem;
`;

// On horizontally-rotated phones and very short screens, scale the video to match
const MediumVideoContainer = styled('div')`
  @media (min-aspect-ratio: 16/9) {
    width: calc(90vh * 1.33);
    margin: 0 auto;
  }
`;

const shortAspectRatio = '9/5';
const shortestAspectRatio = '9/4';
// widthRelativeToBrowserHeight = (Browser width - program padding) * video 4/3 ratio
const widthRelativeToBrowserHeight = 'calc((100vh - 2.8rem) * 1.333)';

// Use the ratio of the video to learn how wide or tall it is, then position
// it accordingly based on the browser ratio
const relativeLeftValue = 'calc((100vw - 2.8rem - ((100vh - 2.8rem) * 1.333)) / 2)';
const relativeTopValue = 'calc(((100vh - 2.8rem - (100vw - 2.8rem) * .75)) / 2)';

const VideoAndControlsColumn = styled('div')`
  position: relative;
  transform: translateZ(0);
  backface-visibility: hidden;
  transition: width 0.4s ease, left 0.4s ease, top 0.4s ease;
  max-width: 100%;

  @media (min-aspect-ratio: 4/3) {
    width: ${props => props.maxMode ? widthRelativeToBrowserHeight : '65%' };
    left: ${props => props.maxMode ? relativeLeftValue : '0' };
  }

  @media (max-aspect-ratio: 4/3) {
    width: ${props => props.maxMode ? '100%' : '65%' };
    top: ${props => props.maxMode ? relativeTopValue : '0' };
  }

  @media (min-aspect-ratio: ${shortAspectRatio}) {
    width: ${props => props.maxMode ? widthRelativeToBrowserHeight : '55%' };
    left: ${props => props.maxMode ? relativeLeftValue : '5%' };
  }

  @media (min-aspect-ratio: ${shortestAspectRatio}) {
    width: ${props => props.maxMode ? widthRelativeToBrowserHeight : '45%' };
    left: ${props => props.maxMode ? relativeLeftValue : '10%' };
  }
`;

const VideoControls = styled('div')`
  padding-top: 1rem;
  display: ${props => props.maxMode ? 'none' : 'flex'};
  justify-content: ${props => props.hasMultipleChannels ? 'space-between' : 'center'}
`;

const InfoColumnContainer = styled('div')`
  position: absolute;
  width: 35%;
  padding-left: 1.4rem;
  transform: translateZ(0);
  backface-visibility: hidden;
  height: calc(100vh - 1.4rem);
  overflow-x: hidden;
  transition: opacity 0.4s ease, right 0.4s ease;
  opacity: ${props => props.maxMode ? '0' : '1' };
  right: ${props => props.maxMode ? '-35%' : '0' };

  @media (min-aspect-ratio: ${shortAspectRatio}) {
    right: ${props => props.maxMode ? '-35%' : '5%' };
  }

  @media (min-aspect-ratio: ${shortestAspectRatio}) {
    right: ${props => props.maxMode ? '-35%' : '10%' };
  }
`;

const infoColumn = css`
  padding-right: 16px;
  margin-right: -16px;
  overflow-y: scroll;
  height: 100%;
`;

const controlButtons = css`
  display: flex;
`;

const channelTitle = css`
  margin: 1rem 0;
`;

export default Program;
