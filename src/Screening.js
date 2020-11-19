import React, { useState, useEffect, useContext, useCallback } from 'react';
import Helmet from 'react-helmet';
import { Link } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import Markdown from 'react-markdown';
import { auth } from './firebase';
import ReactPlayer from 'react-player';
import spacetime from 'spacetime';
import debounce from 'lodash/debounce';

import styled from '@emotion/styled';
import { css } from 'emotion';

import screening_header_logo_wide from './images/screening_header_logo_wide.png';
import screening_header_logo_narrow from './images/screening_header_logo_narrow.png';

import { UserContext } from "./providers/UserProvider";

import { convertTimeToSeconds } from './helpers/utils';

import {
  makeTestScreening,
  getScreening,
  getScreeningAndRegistration,
  getRegisteredInfo,
  registerForScreening,
  unregisterForScreening
} from './firestore/screenings';

import ScreeningRegistrationFlow from './components/ScreeningRegistrationFlow';
import ScreeningVideoPlayer from './components/ScreeningVideoPlayer';
import Tlkio from './components/Tlkio';
import ScreeningAdmin from './components/ScreeningAdmin';
import ScreeningCountdown from './components/ScreeningCountdown';
import ScreeningChatangoChat from './components/ScreeningChatangoChat';

import { ScreeningVideoDetails } from './styles';

const backgroundColor = "#0c0c0c";
const red = "#fc4834";

function Screening(props) {
  const { user, userIsLoaded } = useContext(UserContext);
  const [error, setError] = useState();
  const [isLoaded, setIsLoaded] = useState(false);
  const [preshowPlaying, setPreshowPlaying] = useState(false);

  const isWideScreen = useMediaQuery({ minWidth: 800 });
  const isMobileOrTablet = useMediaQuery({ maxWidth: 800 });
  // const isPortrait = useMediaQuery({ orientation: 'portrait' });

  const {
    startDatetime,
    endDatetime,
    videoTrailer,
    videoTrailerImage,
    preScreeningVideo,
    preScreeningVideoLength
  } = props.screening.fields;

  const contentfulScreening = {
    title: props.screening.fields.title,
    slug: props.screening.fields.slug,
    description: props.screening.fields.description,
    shortDescription: props.screening.fields.shortDescription,
    startDatetime: startDatetime,
    endDatetime: endDatetime,
  }

  /* Check to see if screening and/or member registration exists */
  const [screening, setScreening] = useState(null);
  const [registration, setRegistration] = useState(null);
  useEffect(() => {
    if (!userIsLoaded) return;

    setIsLoaded(false);
    setScreening(null);
    // console.log("[useEffect reset]");
    async function checkScreeningAndRegistration() {
      try {
        const result = await getScreeningAndRegistration(contentfulScreening.slug, user?.uid || null);
        setScreening(result.screening);
        setRegistration(result.registration);
        setIsLoaded(true);
      } catch (e) {
        setError(`${e.name}: ${e.message}`);
      }
    }

    checkScreeningAndRegistration();
  }, [userIsLoaded, user, contentfulScreening.slug]);

  const [registeredInfo, setRegisteredInfo] = useState();
  useEffect(() => {
    if (!registration) return;

    // console.log("Registered user, let's get the private stuff");
    (async () => {
      try {
        const registeredInfo = await getRegisteredInfo(contentfulScreening.slug);
        setRegisteredInfo(registeredInfo);
      } catch(e) {
        setError(`${e.name}: ${e.message}`);
      }
    })();
  }, [registration, contentfulScreening.slug]);

  /* User interactions */
  const register = async () => {
    if (!screening || !user) return;
    // console.log("Registering in component...");
    const registration = await registerForScreening(screening.id, user)
      .catch(e => setError(`${e.name}: ${e.message}`));
    setRegistration(registration);
    setScreening(await getScreening(screening.id, user.uid));
  }

  const unregister = async () => {
    if (!screening || !user) return;
    // console.log("Unregistering in component...");
    const registration = await unregisterForScreening(screening.id, user)
      .catch(e => setError(`${e.name}: ${e.message}`));
    setRegistration(registration);
    setScreening(await getScreening(screening.id, user.uid));
  }

  /* Date and timezone formatting */
  const now = spacetime.now();
  const timezone = now.timezone().name;
  const startTime = spacetime(startDatetime).goto(timezone);
  const endTime = spacetime(endDatetime).goto(timezone);

  /* Set time live film starts after pre-screening video */
  const preScreeningVideoLengthInSeconds = preScreeningVideoLength ? convertTimeToSeconds(preScreeningVideoLength) : 0;
  let liveTime = new Date(startDatetime);
  liveTime.setSeconds(liveTime.getSeconds() + preScreeningVideoLengthInSeconds);

  /* Only run on page load, no matter if the other states change,
  * otherwise this will constantly re-render */
  const [screeningState, setScreeningState] = useState();
  useEffect(() => {
    const setState = () => {
      if (now.isBefore(startTime)) {
        return 'preshow';
      } else if (now.isAfter(endTime)) {
        return 'finished';
      } else {
        if (spacetime(liveTime).isAfter(now)) {
          return 'trailer';
        } else {
          return 'live';
        }
      }
    }

    setScreeningState(setState());
  }, []);

  /* Visual displays of event time */
  contentfulScreening.screeningDate = startTime.format('{day}, {month} {date-ordinal}');
  const timeFormat = startTime.minutes() === 0 ? '{hour}{ampm}' : 'time';
  const screeningTimeEastCoast = startTime.goto('America/New_York').format(timeFormat);
  const screeningTimeWestCoast = startTime.goto('America/Los_Angeles').format(timeFormat);

  /* Max mode lite for this page ! But just manual */
  const [maxMode, setMaxMode] = useState(false);

  function InfoColumnHeader() {
    return (
      <>
        { error &&
          <h4 className={errorText}>{ error }</h4>
        }
        <h1>{ contentfulScreening.title }</h1>
        <h4>A Private Screening</h4>
        <h3 className={marginMedium}>
          Watch Live with us on
          <br />
          { contentfulScreening.screeningDate } @
          <br />
          <span className={time}>{ screeningTimeEastCoast }</span> ET / <span className={time}>{ screeningTimeWestCoast }</span> PT
        </h3>
        { !registration && <p className={marginMedium}>Optional $10 donation to help us cover the costs of screening</p> }
        { !screening && isLoaded &&
          <>
            <CustomHr />
            <h4>There's no screening registration for this screening yet!</h4>
            { process.env.NODE_ENV === "development" &&
              <>
                <p>Reminder!! You need to make sure you're using the <strong>production Firestore database</strong> if you want to create this for production.</p>
                <span style={{textDecoration: "underline", cursor: "pointer"}} onClick={() => makeTestScreening(contentfulScreening.slug)}>Make test screening</span>
              </>
            }
          </>
        }
      </>
    );
  }

  function InfoColumnFooter() {
    return (
      <>
        <CustomHr subtle={isMobileOrTablet} />
        { contentfulScreening.description &&
          <Markdown className={description} source={contentfulScreening.description} />
        }
        { screening && screening.members && screening.members.length &&
          <>
            <CustomHr />
            <ScreeningAdmin
              screening={screening}
            />
          </>
        }
        <CustomHr subtle={isMobileOrTablet} />
          <Link to="/">
            <h4>View all Locally Grown TV &#8594;</h4>
          </Link>
          <br />
          <br />
          <br />
      </>
    );
  }

  /* Show play icon over preshow video once the video has loaded */
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const onPreshowVideoReady = () => {
    setShowPlayIcon(true);
  }

  const renderVideoPlayer = () => {
    return (
      <>
        <ScreeningVideoPlayer
          isLoaded={isLoaded}
          videoTrailer={videoTrailer}
          registration={registration}
          registeredInfo={registeredInfo}
          screeningState={screeningState}
          videoTrailerImage={videoTrailerImage}
          preScreeningVideo={preScreeningVideo}
          liveTime={liveTime}
          red={red}
          maxMode={maxMode}
          setMaxMode={setMaxMode}
        />
        { screeningState && isLoaded &&
          <ScreeningVideoDetails>
            <TrailerText>
              { screeningState === "preshow" && <>Watch the trailer &uarr;</> }
              { screeningState === "trailer" && <>Join us in watching our pre-screening film &uarr;</>}
            </TrailerText>
            <StatusText>
              { screeningState === "finished" && "It's over now!" }
              { (screeningState === "preshow" || screeningState === "trailer") &&
                <ScreeningCountdown
                  screeningState={screeningState}
                  setScreeningState={setScreeningState}
                  startDatetime={startDatetime}
                  endDatetime={endDatetime}
                  liveTime={liveTime}
                  preScreeningVideo={preScreeningVideo}
                  preScreeningVideoLength={preScreeningVideoLength}
                />
              }
            </StatusText>
            { isMobileOrTablet && <CustomHr /> }
          </ScreeningVideoDetails>
        }
      </>
    );
  }

  return (
    <Page>
      <Helmet>
        <title>{ contentfulScreening.title }</title>
      </Helmet>
      { isWideScreen &&
        <WideProgramContainer>
          <Header maxMode={maxMode}>
            <img
              className={wideLogo}
              src={process.env.REACT_APP_DOMAIN + screening_header_logo_wide}
              alt="Black Archives & Locally Grown Present:"
            />
            { user &&
              <LogOutLink>
                <p className={linkStyle} onClick={() => auth.signOut()}>Sign out</p>
                <span style={{color: "#999"}}>{ user.email }</span>
              </LogOutLink>
            }
            <CustomHr />
          </Header>
          <ContentContainer>
            <VideoAndControlsColumn maxMode={maxMode}>
              <ExpandSidebarLink maxMode={maxMode} onClick={() => setMaxMode(false)}>&laquo; Expand sidebar</ExpandSidebarLink>
              { renderVideoPlayer() }
            </VideoAndControlsColumn>
            <InfoColumnContainer maxMode={maxMode}>
              <div className={infoColumn}>
                { registration && (screeningState === "trailer" || screeningState === "live") &&
                  <>
                    <div className={chatHeaderStyles}>
                      <h4>Chat:</h4>
                      <CollapseSidebarLink onClick={() => setMaxMode(true)}>Collapse sidebar &raquo;</CollapseSidebarLink>
                    </div>
                    <ScreeningChatangoChat className={widescreenChat} />
                  </>
                }
                <InfoColumnHeader />
                <ScreeningRegistrationFlow
                  contentfulScreening={contentfulScreening}
                  screening={screening}
                  registration={registration}
                  register={register}
                  unregister={unregister}
                  screeningState={screeningState}
                  isLoaded={isLoaded}
                  setIsLoaded={setIsLoaded} />
                <InfoColumnFooter />
              </div>
            </InfoColumnContainer>
          </ContentContainer>
        </WideProgramContainer>
      }
      { isMobileOrTablet &&
        <>
          <MobileHeader>
            <img
              className={narrowLogo}
              src={screening_header_logo_narrow}
              alt="Black Archives & Locally Grown Present:"
            />
          </MobileHeader>
          { renderVideoPlayer() }
          { registration && (screeningState === "trailer" || screeningState === "live") &&
            <ScreeningChatangoChat className={mobileChat} height="300px" />
          }
          <MobileInfoColumn>
            <InfoColumnHeader />
            <ScreeningRegistrationFlow
              contentfulScreening={contentfulScreening}
              screening={screening}
              registration={registration}
              register={register}
              unregister={unregister}
              screeningState={screeningState}
              isLoaded={isLoaded}
              setIsLoaded={setIsLoaded} />
            <InfoColumnFooter />
            { user &&
              <MobileLogOut>
                <CustomHr subtle />
                <p className={linkStyle} onClick={() => auth.signOut()}>Log out</p>
              </MobileLogOut>
            }
          </MobileInfoColumn>
        </>
      }
    </Page>
  );
}

/* COPIED FROM PROGRAM.JS, FOR NOW */
const WideProgramContainer = styled('div')`
  // display: flex; // Want to have the header at top, don't want flex
  // margin: 1.4rem 1.4rem 0; // Might be able to change Program to use padding instead of margin
  padding: 1.4rem 1.4rem 0;
  position: relative;
  overflow: hidden;
  // height: calc(100vh - 1.4rem); // Because we're using padding not margin
  height: 100vh;
`;

const oppositeVideoRatio = "1.777";
const videoRatio = ".5625";

// For short screens, we actually need the ratio including the buttons
const oppositeVideoRatioWithControls = "1.55";
const videoRatioWithControls = ".645";

// Updated videoAspectRatio due to differently proportioned player elements
const videoAspectRatio = '9/6';
const shortAspectRatio = '9/5';
const shortestAspectRatio = '9/4';
// widthRelativeToBrowserHeight = (Browser width - program padding) * video 4/3 ratio
const widthRelativeToBrowserHeight = `calc((100vh - 2.8rem) * ${oppositeVideoRatioWithControls})`;

// Use the ratio of the video to learn how wide or tall it is, then position
// it accordingly based on the browser ratio
const relativeLeftValue = `calc(((100vw) - 2.8rem - ((100vh - 2.8rem) * ${oppositeVideoRatioWithControls})) / 2)`;
// Adding the first `+ 2rem` here to account for the "Expand sidebar" button absolutely positioned
const relativeTopValue = `calc((((100vh + 2rem) - 2.8rem - (100vw - 2.8rem) * ${videoRatio})) / 2)`;


const VideoAndControlsColumn = styled('div')`
  position: relative;
  transform: translateZ(0);
  backface-visibility: hidden;
  transition: width 0.4s ease, left 0.4s ease, top 0.4s ease;
  max-width: 100%;

  @media (min-aspect-ratio: ${videoAspectRatio}) {
    width: ${props => props.maxMode ? widthRelativeToBrowserHeight : '65%' };
    left: ${props => props.maxMode ? relativeLeftValue : '0' };
    top: ${props => props.maxMode ? "2.5rem" : "0" }; // Same as above
  }

  @media (max-aspect-ratio: ${videoAspectRatio}) {
    width: ${props => props.maxMode ? '100%' : '65%' };
    top: ${props => props.maxMode ? relativeTopValue : '0' };
  }

  @media (min-aspect-ratio: ${shortAspectRatio}) {
    width: ${props => props.maxMode ? widthRelativeToBrowserHeight : '55%' };
    left: ${props => props.maxMode ? relativeLeftValue : '5%' };
    top: ${props => props.maxMode ? "2.5rem" : "0" }; // Not completely sure why this works, not on suuuper wide screens but mostly is fine
  }

  @media (min-aspect-ratio: ${shortestAspectRatio}) {
    width: ${props => props.maxMode ? widthRelativeToBrowserHeight : '45%' };
    left: ${props => props.maxMode ? relativeLeftValue : '10%' };
    top: ${props => props.maxMode ? "2.5rem" : "0" }; // Same as above
  }
`;

const InfoColumnContainer = styled('div')`
  position: absolute;
  width: 35%;
  padding-left: 1.4rem;
  transform: translateZ(0);
  backface-visibility: hidden;
  height: calc(100vh - 1.4rem);
  // TODO: Set the overall page header to be a specific height that makes this
  // scrollable section the correct height
  height: calc(100vh - 1.4rem - 5rem);
  overflow-x: hidden;
  transition: opacity 0.4s ease, right 0.4s ease, top 0.4s ease;
  opacity: ${props => props.maxMode ? '0' : '1' };
  right: ${props => props.maxMode ? '-35%' : '0' };
  // TODO: yep, set things to real heights
  top: 5.8rem;

  @media (min-aspect-ratio: ${shortAspectRatio}) {
    right: ${props => props.maxMode ? '-35%' : '0%' };
  }

  @media (min-aspect-ratio: ${shortestAspectRatio}) {
    right: ${props => props.maxMode ? '-35%' : '10%' };
  }
`;

const infoColumn = css`
  // padding-right: 16px;
  padding-right: calc(16px + 1.4rem);
  margin-right: -16px;
  overflow-y: scroll;
  height: 100%;
`;

/* NEW STYLES BELOW HERE */
const Page = styled('div')`
  min-height: 100vh;
  background-color: ${backgroundColor};

  h1 {
    // Overriding some base paragraph styles (that should probably be updated) */
    @media (max-width: 600px) {
      font-size: 27px;
    }
  }

  h3 {
    @media (max-width: 600px) {
      font-size: 21px;
    }
  }

  h4 {
    font-size: 18px;

    @media (max-width: 600px) {
      font-size: 18px;
    }
  }

  p {
    font-size: 15px;

    @media (max-width: 600px) {
      font-size: 15px;
    }
  }
`;

const CustomHr = styled('hr')`
  border-color: ${props => props.subtle ? "#333" : red };
`;

const ContentContainer = styled('div')`
  display: flex;
`;

const Header = styled('div')`
  position: relative;
  display: flex;
  flex-direction: column;
  transition: opacity 0.4s ease, margin-top 0.4s ease;
  height: 4.5rem;
  opacity: ${props => props.maxMode ? "0" : "1" };
  margin-top: ${props => props.maxMode ? "-6rem" : "0" };
`;

const wideLogo = css`
  max-width: 400px;
  align-self: center;
`;

const LogOutLink = styled('div')`
  position: absolute;
  top: 50%;
  right: 1rem;
  // To account for the email being in the header
  // margin-top: -1.3rem;
  margin-top: -2rem;
  text-align: right;
`;

const linkStyle = css`
  cursor: pointer;
  text-decoration: underline;
`;

const maxModeLinkStyle = `
  text-decoration: underline;
  cursor: pointer;
`;

const ExpandSidebarLink = styled('div')`
  position: absolute;
  top: -2rem;
  right: 0;
  transition: opacity 0.4s ease;
  opacity: ${props => props.maxMode ? "1" : "0" };
  cursor: ${props => props.maxMode ? "pointer" : "default" };
  color: #666;
  ${maxModeLinkStyle}
`;

const CollapseSidebarLink = styled('div')`
  margin-bottom: .5rem;
  color: #ccc;
  ${maxModeLinkStyle}
`;

const chatHeaderStyles = css`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const widescreenChat = css`
  padding-bottom: 1rem;
`;

const MobileHeader = styled('div')`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const narrowLogo = css`
  height: auto;
  width: 70vw;
  max-width: 200px;
`;

const MobileInfoColumn = styled('div')`
  padding: 1rem;
`;

const mobileChat = css`
  padding: 1rem;
`;

const TrailerText = styled('small')`
  display: inline-block;
  color: #999;

  @media screen and (max-width: 800px) {
    text-align: right;
  }
`;

const StatusText = styled('small')`
  text-align: right;

  @media screen and (max-width: 800px) {
    display: none;
  }
`;

const marginMedium = css`
  margin: 1rem 0;
`;

const time = css`
  text-transform: lowercase;
`;

const description = css`
  h3, h4 {
    margin-top: 1rem;
  }

  p {
    margin-top: .5rem;
    line-height: 1.4rem;
  }
`;

const errorText = css`
  color: ${red};
`;

const MobileLogOut = styled('div')`
  padding-bottom: 3rem;
  text-align: center;

  p {
    color: #999;
  }
`;

export default Screening;
