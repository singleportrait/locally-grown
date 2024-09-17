import React, { useState, useEffect } from 'react';
import { functions } from '../firebase';
import styled from '@emotion/styled';

import { css } from '@emotion/css';

function VdoCipherVideoAutoplay(props) {

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
  }, [script, vdoKeys])

  /* Sample VdoCipher event listeners */
  useEffect(() => {
    if (!video) return;

    let timeout;
    const loadListener = video.addEventListener('load', () => {
      console.log("Loaded video");
      // video.seek(4);
      // video.mute();
      // video.play();
      // setCanMute(true);
      timeout = setTimeout(() => {
        setCanMute(true);
        console.log("Able to set mute now");
      }, 8000);
    });
    const endedListener = video.addEventListener('ended', () => {
      console.log("Video ended");
      // video.seek(0);
      // video.play();
    });

    const playListener = video.addEventListener("play", () => {
      console.log("Video playing");
    });

    return () => {
      loadListener();
      clearTimeout(timeout);
      endedListener();
      playListener();
    }
  }, [video]);

  /* Play/pause controls */
  const playPausePageload = () => {
    const playConditions = [-1, 0, 2]; // Loading, ready to play, or paused
    if (playConditions.includes(video.status)) {
      console.log("Loading, ready to play, or paused");
      // video.seek(20);
      // video.mute();
      // video.play();
    } else if (video.status === 3) { // Ended
      console.log("Ended; doing nothing");
    } else if (video.status === 1) {
      console.log("Playing");
      video.pause();
    }
  };

  const playPauseMuted = () => {
    let status;
    const playConditions = [-1, 0, 2]; // Loading, ready to play, or paused
    if (playConditions.includes(video.status)) {
      status = "Loading, ready to play, or paused";
      video.mute();
      video.play();
    } else if (video.status === 3) { // Ended
      status = "Ended; doing nothing";
    } else {
      status = "Playing";
      video.pause();
    }
    // switch (video.status) {
    //   case -1: // Loading
    //   case 0: // Ready to play
    //   case 2: // Paused
    //     status = "Loading, ready to play, or paused";
    //     video.mute();
    //     video.play();
    //     break;
    //   case 1: // Playing
    //     status = "Playing";
    //     video.pause();
    //     break;
    //   case 3: // Ended
    //     status = "Ended; doing nothing";
    //     break;
    //   default:
    //     status = "No status found";
    // }

    console.log(status);
  }

  const playPauseWithoutMute = () => {
    const playConditions = [-1, 0, 2]; // Loading, ready to play, or paused
    if (playConditions.includes(video.status)) {
      console.log("Loading, ready to play, or paused");
      video.seek(10);
      video.play();
      video.unmute();
    } else if (video.status === 3) { // Ended
      console.log("Ended; restart");
      video.seek(0);
      video.play();
    } else {
      console.log("Playing");
      video.pause();
    }
  }

  /* Don't need this, but it's here and works if we do */
  // window.onVdoCipherAPIReady = () => {
  //   console.log("Video cipher api is ready");
  // }

  /* Autoplay video upon final ability to see video */
  const [canMute, setCanMute] = useState();
  useEffect(() => {
    if (!video) return;

    if (video.status === -1) {
      console.log("Loading video");
    }

    if (video.isBuffering) {
      console.log("Buffering...");
    }
    return;
    playPausePageload();
    setTimeout(() => {
      setCanMute(true);
      console.log("Able to set mute now");
    }, 8000);
  }, [video]);

  /* TODO: This will only work if you first *choose* to play the video.
   * This solution won't work long-term and needs to be figured out. */
  const toggleMute = () => {
    if (!video) return;

    if (video.muted) {
      video.unmute();
    } else {
      video.mute();
    }
  }

  const [pageClicked, setPageClicked] = useState();
  const showVideo = () => {
    setPageClicked(true);
  }

  return (
    <>
      <div>
        <VideoContainer>
          <VdoCipherContainer
            id="vdoVideo"
            pageClicked={true}
          />
        </VideoContainer>
        { video &&
          <>
            <p onClick={() => playPauseWithoutMute()}>Toggle play/pause manually (without mute)</p>
          </>
        }
        { video && false &&
          <>
            <h3>You can view the video now</h3>
            <p onClick={() => playPauseMuted()}>Play/pause video (with mute, has to be clicked first for `mute()` to work)</p>
            <p onClick={() => playPauseWithoutMute()}>Toggle play/pause manually (without mute)</p>
            <hr />
            { canMute &&
              <>
                <div>
                  <p onClick={() => showVideo()}>Allow video (Click me first)</p>
                  { pageClicked &&
                  <h4>Page has been clicked</h4>
                  }
                </div>
                <p onClick={() => toggleMute()}>Toggle mute</p>
                <ul>
                  <li>Only works after manually playing first OR ~5 seconds wait</li>
                  <li>BUT, this isn't consistent. We need some way to hook into the user actually being allowed to hit "mute"</li>
                </ul>
              </>
            }
            <br />
          </>
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
`;

const VdoCipherContainer = styled('div')`
  position: absolute;
  // top: -20%;
  top: 0;
  left: 0;
  width: 100%;
  // height: 140%;
  height: 100%;
  display: block;
  visibility: ${props  => props.pageClicked ? "visible" : "hidden"};
`;

export default VdoCipherVideoAutoplay;
