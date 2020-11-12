import React, { useState, useEffect, useContext } from 'react';
import Helmet from 'react-helmet';
import { Link } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import Markdown from 'react-markdown';
import { auth } from './firebase';
import ReactPlayer from 'react-player';

import styled from '@emotion/styled';
import { css } from 'emotion';

import { UserContext } from "./providers/UserProvider";

import { calculateTimeLeft } from './helpers/utils';

import {
  makeTestScreening,
  getScreening,
  getScreeningAndRegistration,
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

  const contentfulScreening = {
    title: props.screening.fields.title,
    slug: props.screening.fields.slug,
    description: props.screening.fields.description,
    videoTrailer: props.screening.fields.videoTrailer,
    startDatetime: props.screening.fields.startDatetime
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

  /* User interactions */
  const register = async () => {
    if (!screening || !user) return;
    console.log("Registering in component...");
    const registration = await registerForScreening(screening.id, user)
      .catch(e => setError(`${e.name}: ${e.message}`));
    setRegistration(registration);
    setScreening(await getScreening(screening.id, user.uid));
  }

  const unregister = async () => {
    if (!screening || !user) return;
    console.log("Unregistering in component...");
    const registration = await unregisterForScreening(screening.id, user)
      .catch(e => setError(`${e.name}: ${e.message}`));
    setRegistration(registration);
    setScreening(await getScreening(screening.id, user.uid));
  }

  /* Date formatting */
  const startTime = new Date(contentfulScreening.startDatetime);
  contentfulScreening.screeningDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }).format(startTime);

  let format = {
    hour: 'numeric'
  };

  if (startTime.getMinutes() !== 0) {
    format.minute = 'numeric';
  }

  contentfulScreening.screeningTimeEastCoast = new Intl.DateTimeFormat('en-US', {
    ...format,
    timeZone: 'America/New_York',
    // timeZoneName: 'short'
  }).format(startTime);

  contentfulScreening.screeningTimeWestCoast = new Intl.DateTimeFormat('en-US', {
    ...format,
    timeZone: 'America/Los_Angeles',
    // timeZoneName: 'short'
  }).format(startTime);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(startTime));
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("Setting time");
      setTimeLeft(calculateTimeLeft(startTime));
    }, 1000);

    if (timeLeft?.complete) {
      clearTimeout(timer);
    }
    return () => clearTimeout(timer);
  }, [startTime, timeLeft.complete]);

  function InfoColumnHeader() {
    return (
      <>
        <h1>{ contentfulScreening.title }</h1>
        <h4>A Private Screening</h4>
        <h3 className={marginMedium}>
          Watch LIVE with us on
          <br />
          { contentfulScreening.screeningDate } @
          <br />
          <span className={time}>{ contentfulScreening.screeningTimeEastCoast }</span> ET / <span className={time}>{ contentfulScreening.screeningTimeWestCoast }</span> PT
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
        { (contentfulScreening.videoTrailer && !timeLeft.complete) ||
          (contentfulScreening.videoTrailer && timeLeft.complete && !registration) &&
          <VideoWrapper>
            <ReactPlayer
              url={contentfulScreening.videoTrailer.fields.url}
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
        { registration && timeLeft.complete &&
          /* To pull from `screenings/{screeningId}/registeredInfo/{screeningId} */
          <VdoCipherVideo
            videoId="1feaa1e1b0d94af2a92dd020b15dedc6"
          />
        }
        <VideoDetails>
          <TrailerText>Watch the trailer</TrailerText>
          { timeLeft && !timeLeft.complete &&
            <small>Starting in: { timeLeft.hours }:{ timeLeft.minutes }:{ timeLeft.seconds }</small>
          }
          { timeLeft && timeLeft.complete &&
            <small>Showtime :)</small>
          }
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
                { registration && timeLeft.complete &&
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
      { error &&
        <>
          There's an error.
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

export default Screening;
