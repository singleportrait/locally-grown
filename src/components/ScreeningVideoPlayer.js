import React, { useState } from 'react';
import ReactPlayer from 'react-player';

import styled from '@emotion/styled/macro';
import { css } from 'emotion/macro';

import PlayButton from './PlayButton';
import HostedVideo from './HostedVideo';

import { ScreeningPreshowImage, ScreeningVideoDetails } from '../styles';

function ScreeningVideoPlayer(props) {
  const [preshowPlaying, setPreshowPlaying] = useState(false);

  const { isLoaded,
    videoTrailer,
    registration,
    registeredInfo,
    screeningState,
    videoTrailerImage,
    preScreeningVideo,
    liveTime,
    red,
    maxMode,
    setMaxMode
  } = props;

  /* Show play icon over preshow video once the video has loaded */
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const onPreshowVideoReady = () => {
    setShowPlayIcon(true);
  }

  return (
      <>
        { !isLoaded && <VideoWrapper /> }
        { videoTrailer && isLoaded &&
          ((registration && screeningState === "preshow") ||
          (registration && screeningState === "finished") ||
          !registration) &&
          <VideoWrapper>
            <ReactPlayer
              url={videoTrailer.fields.url}
              playing={preshowPlaying}
              width="100%"
              height="100%"
              className={reactPlayer}
              onReady={onPreshowVideoReady}
              controls={true}
              config={{
                youtube: {
                  modestbranding: 1,
                  rel: 0 // Doesn't work, sadly; could try something later
                }
              }}
            />
            { videoTrailerImage && !preshowPlaying &&
              <>
                <ScreeningPreshowImage backgroundImage={`${videoTrailerImage.fields.file.url}?fm=jpg&fl=progressive`} />
                { showPlayIcon &&
                  <PlayButton
                    className={playButton}
                    color={red}
                    togglePlaying={() => setPreshowPlaying(!preshowPlaying)}
                  />
                }
              </>
            }
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
          <HostedVideo
            registeredInfo={registeredInfo}
            liveTime={liveTime}
          />
        }
      </>
    )
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

const playButton = css`
  position: absolute;
  bottom: 2rem;
  left: 2rem;
  z-index: 2;
  cursor: pointer;

  @media screen and (max-width: 800px) {
    bottom: 1rem;
    left: 1rem;
    transform-origin: bottom left;
    transform: scale(.75);
  }
`;

export default ScreeningVideoPlayer;
