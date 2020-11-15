import React, { useState, useEffect, useContext } from 'react';
import Helmet from 'react-helmet';
import { Link } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import Markdown from 'react-markdown';
import { auth } from './firebase';
import ReactPlayer from 'react-player';
import spacetime from 'spacetime';

import styled from '@emotion/styled';
import { css } from 'emotion';

import { UserContext } from "./providers/UserProvider";

import { calculateTimeLeft, convertTimeToSeconds } from './helpers/utils';

import {
  makeTestScreening,
  getScreening,
  getScreeningAndRegistration,
  getRegisteredInfo,
  registerForScreening,
  unregisterForScreening
} from './firestore/screenings';

import ScreeningRegistrationFlow from './components/ScreeningRegistrationFlow';
import VdoCipherVideo from './components/VdoCipherVideo';
import Tlkio from './components/Tlkio';

const backgroundColor = "#111";
const red = "#fc4834";

function Screening(props) {
  const { user, userIsLoaded } = useContext(UserContext);
  const [error, setError] = useState();
  const [isLoaded, setIsLoaded] = useState(false);

  const isWideScreen = useMediaQuery({ minWidth: 800 });
  const isMobileOrTablet = useMediaQuery({ maxWidth: 800 });
  // const isPortrait = useMediaQuery({ orientation: 'portrait' });

  const {
    startDatetime,
    endDatetime,
    videoTrailer,
    preScreeningVideo,
    preScreeningVideoLength
  } = props.screening.fields;

  const contentfulScreening = {
    title: props.screening.fields.title,
    slug: props.screening.fields.slug,
    description: props.screening.fields.description
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
      const result = await getScreeningAndRegistration(contentfulScreening.slug, user?.uid || null)
        .catch(e => setError(`${e.name}: ${e.message}`));

      setScreening(result.screening);
      setRegistration(result.registration);
      setIsLoaded(true);
    }

    checkScreeningAndRegistration();
  }, [userIsLoaded, user, contentfulScreening.slug]);

  const [registeredInfo, setRegisteredInfo] = useState();
  useEffect(() => {
    if (!registration) return;

    // console.log("Registered user, let's get the private stuff");
    (async () => {
      const registeredInfo = await getRegisteredInfo(contentfulScreening.slug)
        .catch(e => setError(`${e.name}: ${e.message}`));
      setRegisteredInfo(registeredInfo);
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

  /* Custom hook for calculating various countdowns */
  const useExpired = (time, beforeState, afterState, customCheck = null) => {
    const [expired, setExpired] = useState();
    useEffect(() => {
      if (screeningState !== beforeState) return;
      if (customCheck) customCheck();

      const timeoutRef = setTimeout(() => {
        const timeLeft = calculateTimeLeft(time);
        // console.log("Time left", timeLeft);
        if (timeLeft.complete) {
          clearTimeout(timeoutRef);
          setScreeningState(afterState);
          return false;
        }
        setExpired(timeLeft);
      }, 1000);
      return () => clearTimeout(timeoutRef);
    }, [time, beforeState, afterState, customCheck]);
    return expired;
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

  /* For some reason, spacetime's stateTime won't work here, but using the
   * proper Date() does work, no matter the time zone */
  const dateTime = new Date(startDatetime);
  const timeLeftUntilScreening = useExpired(dateTime, "preshow", "trailer");

  const customCheck = () => {
    if (!preScreeningVideo || !preScreeningVideoLength) {
      // console.log("This screening doesn't have a pre-screening video");
      setScreeningState("live");
      return;
    }
  }

  const timeLeftUntilLive = useExpired(liveTime, "trailer", "live", customCheck);

  const finishedTime = new Date(endDatetime);
  const timeUntilFinished = useExpired(finishedTime, "live", "finished");

  /* Visual displays of event time */
  contentfulScreening.screeningDate = startTime.format('{day}, {month} {date-ordinal}');
  const timeFormat = startTime.minutes() === 0 ? '{hour}{ampm}' : 'time';
  const screeningTimeEastCoast = startTime.goto('America/New_York').format(timeFormat);
  const screeningTimeWestCoast = startTime.goto('America/Los_Angeles').format(timeFormat);

  function InfoColumnHeader() {
    return (
      <>
        { error &&
          <h4 className={errorText}>{ error }</h4>
        }
        <h1>{ contentfulScreening.title }</h1>
        <h4>A Private Screening</h4>
        <h3 className={marginMedium}>
          Watch LIVE with us on
          <br />
          { contentfulScreening.screeningDate } @
          <br />
          <span className={time}>{ screeningTimeEastCoast }</span> ET / <span className={time}>{ screeningTimeWestCoast }</span> PT
        </h3>
        <p className={marginMedium}>Optional $10 donation to help us cover the costs of screening</p>
        { !screening && isLoaded &&
          <>
            <hr />
            <h4>There's no screening registration for this screening yet!</h4>
            { process.env.NODE_ENV === "development" &&
              <>
                <p>Reminder!! You need to make sure you're using the <strong>production Firestore database</strong> when you click this</p>
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
        <hr />
        { contentfulScreening.description &&
          <Markdown className={description} source={contentfulScreening.description} />
        }
        <hr />
          <br />
          { process.env.NODE_ENV === "development" &&
            <Link to="/screenings">Back to screenings</Link>
          }
          <br />
          <Link to="/">Back to home</Link>
          <br />
          <br />
          <br />
      </>
    );
  }

  const renderVideoPlayer = () => {
    return (
      <>
        { videoTrailer &&
          (!registration ||
          (registration && screeningState === "preshow") ||
          (registration && screeningState === "finished")) &&
          <VideoWrapper>
            <ReactPlayer
              url={videoTrailer.fields.url}
              width="100%"
              height="100%"
              className={reactPlayer}
              config={{
                youtube: {
                  modestbranding: 1,
                  rel: 0 // Doesn't work, sadly; could try something later
                }
              }}
            />
          </VideoWrapper>
        }
        { preScreeningVideo && registration && screeningState === "trailer" &&
          <VideoWrapper>
            <ReactPlayer
              url={preScreeningVideo.fields.url}
              width="100%"
              height="100%"
              playing={true}
              muted={true}
              playsinline={true}
              className={reactPlayer}
              config={{
                youtube: {
                  modestbranding: 1,
                  rel: 0 // Doesn't work, sadly; could try something later
                }
              }}
            />
          </VideoWrapper>
        }
        { registration && registeredInfo && screeningState === "live" &&
          /* To pull from `screenings/{screeningId}/registeredInfo/{screeningId} */
          <VdoCipherVideo
            videoId={registeredInfo.videoId}
          />
        }
        <VideoDetails>
          <TrailerText>Watch the trailer</TrailerText>
          <small style={{textAlign: "right"}}>
            { screeningState === "preshow" && "Preshow" }
            { screeningState === "trailer" && "Trailer" }
            { screeningState === "live" && "Showtime :)" }
            { screeningState === "finished" && "It's over now!" }

            { screeningState === "preshow" && timeLeftUntilScreening &&
              <><br />Starting in: { timeLeftUntilScreening.hours }:{ timeLeftUntilScreening.minutes }:{ timeLeftUntilScreening.seconds }</>
            }
            { screeningState === "trailer" && timeLeftUntilLive &&
              <>
                <br />
                Showing pre-screening film; time until film starts: { timeLeftUntilLive.hours }:{ timeLeftUntilLive.minutes }:{ timeLeftUntilLive.seconds }
              </>
            }
          </small>
        </VideoDetails>
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
          <Header>
            <h2 style={{textAlign: "center"}}>Black Archives & Locally Grown Present:</h2>
            { user &&
              <LogOutLink>
                <p className={linkStyle} onClick={() => auth.signOut()}>Sign out</p>
                { user.email }
              </LogOutLink>
            }
            <hr />
          </Header>
          <ContentContainer>
            <VideoAndControlsColumn>
              { renderVideoPlayer() }
            </VideoAndControlsColumn>
            <InfoColumnContainer>
              <div className={infoColumn}>
                { registration && (screeningState === "trailer" || screeningState === "live") &&
                  <Tlkio />
                }
                <InfoColumnHeader />
                <ScreeningRegistrationFlow
                  contentfulScreening={contentfulScreening}
                  screening={screening}
                  registration={registration}
                  register={register}
                  unregister={unregister}
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
            <h2 style={{textAlign: "center"}}>Black Archives & Locally Grown Present:</h2>
            <hr />
          </MobileHeader>
          { renderVideoPlayer() }
          <MobileInfoColumn>
            <InfoColumnHeader />
            <ScreeningRegistrationFlow
              contentfulScreening={contentfulScreening}
              screening={screening}
              registration={registration}
              register={register}
              unregister={unregister}
              isLoaded={isLoaded}
              setIsLoaded={setIsLoaded} />
            <InfoColumnFooter />
            { user && <p className={linkStyle} onClick={() => auth.signOut()}>Log out</p>}
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
  // padding-right: 16px;
  padding-right: 32px;
  margin-right: -16px;
  overflow-y: scroll;
  height: 100%;
`;

/* NEW STYLES BELOW HERE */
const Page = styled('div')`
  min-height: 100vh;
  background-color: ${backgroundColor};

  hr {
    border-color: ${red};
  }
`;

const ContentContainer = styled('div')`
  display: flex;
`;

const Header = styled('div')`
  position: relative;
`;

const LogOutLink = styled('div')`
  position: absolute;
  top: 50%;
  right: 1rem;
  margin-top: -1.3rem;
  text-align: right;
`;

const linkStyle = css`
  cursor: pointer;
  text-decoration: underline;
`;

const MobileHeader = styled('div')`
  padding: 1rem;
`;

const MobileInfoColumn = styled('div')`
  padding: 1rem;
`;

const VideoWrapper = styled('div')`
  position: relative;
  padding-top: 56.25%
`;

const reactPlayer = css`
  position: absolute;
  top: 0;
  left: 0;
`;

const VideoDetails = styled('div')`
  padding-top: .5rem;
  display: flex;
  justify-content: space-between;
`;

const TrailerText = styled('small')`
  display: inline-block;
  padding-top: .5rem;
  color: #999;

  @media screen and (max-width: 800px) {
    padding-left: 1rem;
    padding-right: 1rem;
    text-align: right;
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
  }
`;

const errorText = css`
  color: ${red};
`;

export default Screening;
