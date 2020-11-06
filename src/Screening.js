import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import Markdown from 'react-markdown';
import { auth } from './firebase';
import ReactPlayer from 'react-player';

import styled from '@emotion/styled';
import { css } from 'emotion';

import { UserContext } from "./providers/UserProvider";

import { generateUserDocument } from './firestore/users';
import {
  makeTestHotIronsScreening,
  getScreening,
  getScreeningRegistration,
  registerForScreening,
  unregisterForScreening
} from './firestore/screenings';

import ScreeningRegistrationFlow from './components/ScreeningRegistrationFlow';

const backgroundColor = "#111";
const red = "#fc4834";

function Screening(props) {
  const { user } = useContext(UserContext);
  const [error, setError] = useState();
  const [isLoaded, setIsLoaded] = useState(true);

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

  /* Check to see if user exists in Firestore (not Auth),
  * and re-check screening when users log in and out */
  useEffect(() => {
    console.log("User in useEffect:", user?.uid);

    generateUserDocument(user);
  }, [user]);

  /* Check to see if screening and/or member registration exists */
  const [screening, setScreening] = useState(null);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    setIsLoaded(false);
    setRegistration(null); // For user logging out

    async function checkScreeningAndRegistration() {
      console.log("[Checking screening in useEffect...]");
      const screeningResult = await getScreening(contentfulScreening.slug, user?.uid || null)
        .catch(e => setError(`${e.name}: ${e.message}`));

      let registrationResult = null;
      if (user) {
        console.log("[Checking registration in useEffect...]");
        registrationResult = await getScreeningRegistration(contentfulScreening.slug, user.uid)
          .catch(e => setError(`Error checking registration ${e}`));
      }

      // Can set a manual slowdown here whenever it's time to style the loading state
      setScreening(screeningResult);
      setRegistration(registrationResult);
      setIsLoaded(true);
    }

    checkScreeningAndRegistration();
  }, [user, contentfulScreening.slug]);

  /* Issue: Because the below necessarily updates the screening to get the latest
   * registered screening total, it causes the registration useEffect block to
   * be run twice, once in here and then above. However, if we don't setRegistration
   * here, it's a bit confusing—though, not necessarily incorrect. */
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

  const date = new Date(contentfulScreening.startDatetime);
  const screeningDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  }).format(date);

  const screeningTimeEastCoast = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    timeZone: 'America/New_York',
    // timeZoneName: 'short'
  }).format(date);

  const screeningTimeWestCoast = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    timeZone: 'America/Los_Angeles',
    // timeZoneName: 'short'
  }).format(date);

  function InfoColumnHeader() {
    return (
      <>
        <h1>{ contentfulScreening.title }</h1>
        <h4>A Private Screening{ screening && ` for ${screening.totalAllowed} viewers`}</h4>
        <h3 className={marginMedium}>
          Watch LIVE with us on
          <br />
          { screeningDate } @
          <br />
          <span className={time}>{ screeningTimeEastCoast }</span> ET / <span className={time}>{ screeningTimeWestCoast }</span> PT
        </h3>
        <p className={marginMedium}>Optional $10 donation to help us cover the costs of screening</p>
        { !screening && isLoaded &&
          <>
            <hr />
            <h4>There's no screening registration for this screening yet!</h4>
            <p style={{textDecoration: "underline", cursor: "pointer"}} onClick={() => makeTestHotIronsScreening(contentfulScreening.slug)}>Make test screening</p>
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
          <Markdown source={contentfulScreening.description} />
        }
        <hr />
          <br />
          <Link to="/screenings">Back to screenings</Link>
          <br />
          <Link to="/">Back to home</Link>
      </>
    );
  }

  const renderVideoPlayer = () => {
    return (
      <>
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
        <TrailerText>Watch the trailer</TrailerText>
      </>
    );
  }

  return (
    <Page>
      { isWideScreen &&
        <WideProgramContainer>
          <Header>
            <h2 style={{textAlign: "center"}}>Black Archives & Locally Grown Present:</h2>
            { user && isWideScreen && <LogOutLink className={linkStyle} onClick={() => auth.signOut()}>Sign out</LogOutLink>}
            <hr />
          </Header>
          <ContentContainer>
            <VideoAndControlsColumn>
              { contentfulScreening.videoTrailer && renderVideoPlayer() }
            </VideoAndControlsColumn>
            <InfoColumnContainer>
              <div className={infoColumn}>
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
          { contentfulScreening.videoTrailer && renderVideoPlayer() }
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
  padding-right: 16px;
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

export default Screening;
