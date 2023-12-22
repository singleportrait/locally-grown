import React, { useState, useEffect } from 'react';
import { functions } from '../firebase';
import styled from '@emotion/styled';

import { css } from '@emotion/css';

import MuteButton from './MuteButton';
import PlayButton from './PlayButton';
import FullscreenPageButton from './FullscreenPageButton';

import { VideoOverlay, ScreeningPreshowImage, ScreeningVideoDetails } from '../styles';

function VdoCipherVideo(props) {

  /* Requesting otp and playback info from the server, which we should do eventually */
  const [vdoKeys, setVdoKeys] = useState({});
  useEffect(() => {

    const fetchRealVideo = async () => {
      const callFunction = functions.httpsCallable('vdoCipher-getOTPAndPlaybackInfo');
      callFunction({videoId: props.videoId})
        .then(result => {
          setVdoKeys(result.data);
        }).catch(error => {
          console.log("Error requesting function: \n", error);
        });
    }

    fetchRealVideo();
  }, [props.videoId]);

  /* Add VdoCipher script to page, then save `video` once it loads */
  /* Run within useEffect to prevent it being added twice */
  const [script] = useState(document.createElement("script"));
  const [video, setVideo] = useState();

  useEffect(() => {
    if (!vdoKeys.otp || !vdoKeys.playbackInfo) return;

    // console.log("Vdo keys", vdoKeys);
    script.src = "https://player.vdocipher.com/playerAssets/1.x/vdo.js";
    script.async = true;
    document.body.appendChild(script);
    script.onload = () => addVdo();

    let vdo;
    const addVdo = () => {
      vdo = window.vdo;
      vdo.add({
        otp: vdoKeys.otp,
        playbackInfo: vdoKeys.playbackInfo,
        theme: "9ae8bbe8dd964ddc9bdb932cca1cb59a",
        container: document.querySelector( "#vdoVideo" ),
      });

      setVideo(vdo.getObjects()[0]);
    }

    return () => {
      script.remove();
      window.vdo = undefined;
    }
  }, [script, vdoKeys])

  /* Script to find out where to seek in the film */
  const getSeekTime = () => {
    const now = new Date();
    const difference = (Date.parse(now) - Date.parse(props.liveTime))/1000;

    // console.log("Time movie should start:", props.liveTime);
    // console.log("Time it is now", now);
    // console.log("Difference between the two:", difference);

    return difference;
  }

  /* VdoCipher event listeners */
  const [videoIsLoaded, setVideoIsLoaded] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [videoPlayed, setVideoPlayed] = useState(false);
  const [muted, setMuted] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!video) return

    /* Catching errors on mobile after 10 second delay, for now */
    const errorTimeout = setTimeout(() => {
      // console.log("Checking after 10 seconds to see if video loaded");
      if (video.status === -1) {
        setError("Error loading video. Please try on desktop Chrome for best support.");
      }
    }, 15000);

    // console.log("Video is set now", video);
    const loadListener = video.addEventListener('load', () => {
      setVideoIsLoaded(true);
      // console.log("Loaded video");
      // If time we try to seek to is later than the end of the video, don't play it
      if (getSeekTime() > Math.round(video.duration)) {
        setVideoEnded(true);
      }
    });

    const endedListener = video.addEventListener('ended', () => {
      setVideoEnded(true);
    });

    const playListener = video.addEventListener("play", () => {
      // console.log("Video playing");
      video.seek(getSeekTime());
      setVideoPlayed(true);
      setMuted(false);
    });

    /* Example of listening to properties on video */
    // if (video.isBuffering) {
    //   console.log("Buffering...");
    // }

    return () => {
      loadListener();
      endedListener();
      playListener();
      clearTimeout(errorTimeout);
    }
  }, [video, getSeekTime, error]);

  /* Ability to toggle mute */
  const toggleMute = () => {
    if (!video) return;

    if (video.muted) {
      video.unmute();
      setMuted(false);
    } else {
      video.mute();
      setMuted(true);
    }
  }

  return (
    <>
      <div>
        <VideoContainer>
          { (error || !videoIsLoaded) &&
            <VideoOverlayMessage>
              { error && error }
              { !error && !videoIsLoaded && "Loading video..." }
            </VideoOverlayMessage>
          }
          { video && videoIsLoaded && !videoPlayed && !videoEnded &&
            <PlayButtonContainer>
              <PlayButton
                color={props.color}
                togglePlaying={() => setPreshowPlaying(!preshowPlaying)}
              />
            </PlayButtonContainer>
          }
          { videoPlayed && <VideoOverlay onClick={() => props.maxMode ? props.setMaxMode(false) : undefined}/> }
          { videoEnded && props.videoTrailerImage &&
            <ScreeningPreshowImage
              onClick={() => props.maxMode ? props.setMaxMode(false) : undefined}
              backgroundImage={`${props.videoTrailerImage.fields.file.url}?fm=jpg&fl=progressive`}
            />
          }
          <VdoCipherContainer
            id="vdoVideo"
            hidden={!videoIsLoaded || videoEnded}
          />
        </VideoContainer>
        { video && videoIsLoaded &&
          <ScreeningVideoDetails alignEnd={videoPlayed && !videoEnded}>
            { !videoEnded &&
              <>
                { !videoPlayed && <p>Click play to begin!</p> }
                { videoPlayed &&
                  <ControlsContainer>
                    <FullscreenPageButton />
                    <MuteButton muted={muted} toggleMute={toggleMute} />
                  </ControlsContainer>
                }
              </>
            }
            { videoEnded &&
              <small style={{color: "#999"}}>The film has ended. Thanks for joining us!</small>
            }
          </ScreeningVideoDetails>
        }
      </div>
    </>
    );
}

const VideoContainer = styled('div')`
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  overflow: hidden;
  background-color: #000;
  display: flex;
  justify-content: center;
`;

const overlayStyle = `
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
`;

const VideoOverlayMessage = styled('h3')`
  ${overlayStyle}
  padding: 0 2rem;
`;

const PlayButtonContainer = styled('div')`
  ${overlayStyle}
  z-index: 1;
  pointer-events: none;
  touch-action: none;
`;

const VdoCipherContainer = styled('div')`
  position: absolute;
  top: 0;
  top: -20%;
  left: 0;
  width: 100%;
  height: 100%;
  height: 140%;
  display: block;
  ${props => props.hidden && "visibility: hidden;" }
`;

const ControlsContainer = styled('div')`
  position: relative;
  margin-top: -.5rem;
  margin-right: -1rem;
  display: flex;
`;

export default VdoCipherVideo;
