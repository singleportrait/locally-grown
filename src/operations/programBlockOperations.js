import { setCurrentProgramBlock, addProgramBlock, setCurrentVideo, programBlockError } from '../actions/programBlockActions';
import store from '../store';
import consoleLog from '../helpers/consoleLog';
import ReactGA from 'react-ga';

import { shuffleArray, convertTimeToSeconds, currentSecondsPastTheHour } from '../helpers/utils';

// This enables testing switching over to a new hour
// Only enable debug mode in development
// Set this to `true` when testing
const debugMode = false && process.env.NODE_ENV === `development`;

const findProgramBlock = (programBlockId) => {
  return new Promise(function(resolve, reject) {
    let matchingProgramBlock = null;
    store.getState().channels.allChannels.find(channel => {
      return channel.fields.programs.find(program => {
        if (program.fields && program.fields.programBlocks) {
          return program.fields.programBlocks.find(programBlock => {
            if (programBlock.sys.id === programBlockId) {
              matchingProgramBlock = programBlock;
              return programBlock;
            }
            return false;
          });
        }
        return false;
      });
    });

    resolve(matchingProgramBlock);
  });
}

const fetchProgramBlock = (programBlockId) => dispatch => {
  return new Promise(function(resolve, reject) {
    // Using video results from initial Contentful fetch, now
    findProgramBlock(programBlockId)
    .then(programBlock => {
      dispatch(initializeCurrentProgramBlockVideos(programBlock))
      .then(loadedProgramBlock => {
        dispatch(addProgramBlock(loadedProgramBlock));

        resolve(loadedProgramBlock);
      });
    });
  });
};

const initializeCurrentProgramBlockVideos = (currentProgramBlock) => dispatch => {
  consoleLog("- Initializing program block: ", currentProgramBlock.fields.title);
  return new Promise(function(resolve, reject) {
    if (!currentProgramBlock.fields.videos) {
      consoleLog("No videos in this program block!");
      const loadedProgramBlock = {
        sys: currentProgramBlock.sys,
        fields: currentProgramBlock.fields
      }
      return dispatch(programBlockError(loadedProgramBlock, "Warning: This program block doesn't have any videos!"));
    }

    // Doing this copy ish again, to prevent overwriting original info before we're ready,
    // and especially to prevent duplicate videos from not getting correct
    // indexes and start & end times
    // I'm not using rfdc clone() in this file because it seemed to slow down performance, somehow
    let videos = JSON.parse(JSON.stringify(currentProgramBlock.fields.videos));

    if (currentProgramBlock.fields.isRandom) {
      consoleLog("- This program block is random.");
      videos = shuffleArray(videos);
    }

    let programmingLength = 0;
    // For debugging when the hour switches to a new one
    const secondsPastTheHour = debugMode ? 0 : currentSecondsPastTheHour();

    consoleLog("- Seconds past the hour in initializeCurrentProgramBlockVideos: " + secondsPastTheHour);

    let videoToPlayIndex = 0;
    let timestampToStartVideo = 0;
    let videosLength = videos.length;

    // Set individual video lengths & full programming length
    videos.forEach((video, i) => {
      if ('length' in video.fields) {
        const videoLengthInSeconds = convertTimeToSeconds(video.fields.length);
        video.lengthInSeconds = videoLengthInSeconds;
        consoleLog("- Setting up video", i, video.fields.title);

        // Calculate the video info differently if it starts at a custom timestamp
        if (video.fields.customStartTimestamp) {
          consoleLog("- The video has a custom start time");
          const manualTimestamp = convertTimeToSeconds(video.fields.customStartTimestamp);
          if (manualTimestamp === 0) {
            consoleLog(`- The video ${video.fields.title} has a custom timestamp, but it was in a weird format so we're not using it.`);
            ReactGA.event({
              category: "Custom Timestamp Error",
              action: "Wrong Format",
              label: `${video.fields.title}: ${video.fields.customStartTimestamp}`,
              nonInteraction: true
            });

          } else {
            consoleLog("- - Converting and saving custom start time:", manualTimestamp);
            video.lengthInSeconds = videoLengthInSeconds - manualTimestamp;
            video.manualTimestamp = manualTimestamp;
          }
        }

        video.startTime = programmingLength;
        video.endTime = programmingLength + video.lengthInSeconds;
        video.index = i;

        // IF:
        // - the total length of programming so far is earlier than the current time past the hour
        // - AND the end time of the video is later than the current time past the hour
        // OR:
        // - we're at the beginning of the hour
        // - AND it's the first video in the list
        // THEN: This is the video to play
        if ((programmingLength < secondsPastTheHour && video.endTime > secondsPastTheHour) || (secondsPastTheHour === 0 && i === 0)) {
          videoToPlayIndex = i;

          timestampToStartVideo = secondsPastTheHour - programmingLength;
          consoleLog(`- - The chosen video "${video.fields.title}" will start at ${timestampToStartVideo} seconds past the hour`);
          if (video.manualTimestamp) {
            timestampToStartVideo = timestampToStartVideo + video.manualTimestamp;
            consoleLog("- - Using custom start time in initializeCurrentProgramBlockVideos:", timestampToStartVideo);
          }
        }

        programmingLength = video.endTime;
      } else {
        // TODO: This is potentially where we could make requests to YT/Vimeo
        // to get the duration, but it's probably not worth the effort
        consoleLog("- A video doesn't have a length!");
      }
    })

    if (programmingLength === 0) {
      consoleLog("- There was an error calculating the programming length for this hour (potentially due to misformated video lengths.");
    }
    else if (programmingLength < 3600) {
      consoleLog(`- This programming ends at ${Math.round(programmingLength/60)} minutes past the hour, but we're duplicating videos until the content is long enough!`);

      // This is where you append the video content, until you hit 3600
      let j = 0;
      while (programmingLength < 3600) {
        const newVideo = JSON.parse(JSON.stringify(videos[j]));
        // Calculate start & end time for new copied video
        newVideo.startTime = programmingLength;
        newVideo.endTime = programmingLength + newVideo.lengthInSeconds;
        newVideo.index = videos.length;
        videos.push(newVideo);

        if (programmingLength < secondsPastTheHour && newVideo.endTime > secondsPastTheHour) {
          videoToPlayIndex = videos.length - 1;

          timestampToStartVideo = secondsPastTheHour - programmingLength;
          if (newVideo.manualTimestamp) {
            // consoleLog("- Using custom start time when repeating videos");
            timestampToStartVideo = timestampToStartVideo + newVideo.manualTimestamp;
          }
        }

        programmingLength += newVideo.lengthInSeconds;
        if (j === 0 || j < videosLength) {
          j++;
        } else {
          j = 0;
        }
      }

      // consoleLog("Original videos object", videos);
      // consoleLog(programmingLength);
    }

    if (programmingLength < secondsPastTheHour) {
      consoleLog("- The programming isn't even enough to get to this time in the hour!");
    }

    if (secondsPastTheHour === 0) {
      videoToPlayIndex = 0;
    }

    // Using what we've done to set it back on the object
    currentProgramBlock.fields.videos = videos;

    const loadedProgramBlock = {
      sys: currentProgramBlock.sys,
      fields: currentProgramBlock.fields,
      currentVideo: videos[videoToPlayIndex],
      videoPlayingIndex: videoToPlayIndex,
      programmingLength: programmingLength,
      timestampToStartVideo: timestampToStartVideo
    }

    resolve(loadedProgramBlock);
  })
}

// Finds the video to play after switching away from the channel
const setupCurrentVideoAfterInitialLoad = () => dispatch => {
  consoleLog("Updating current video info after switching channels; setupCurrentVideoAfterInitialLoad()");
  const currentProgramBlock = store.getState().programBlocks.currentProgramBlock;
  // For debugging new videos playing
  const secondsPastTheHour = debugMode ? 0 : currentSecondsPastTheHour();

  consoleLog("- Seconds past the hour in setupCurrentVideoAfterInitialLoad:", secondsPastTheHour);

  const videos = currentProgramBlock.fields.videos;

  let videoToPlayIndex = 0;
  let timestampToStartVideo = 0;
  videos.forEach((video, i) => {
    if ('length' in video.fields) {
      if (video.startTime < secondsPastTheHour && video.endTime > secondsPastTheHour) {
        videoToPlayIndex = i;
        if (video.manualTimestamp) {
          consoleLog("- Using custom start time in setupCurrentVideoAfterInitialLoad");
          timestampToStartVideo = secondsPastTheHour - video.startTime + video.manualTimestamp;
        } else {
          timestampToStartVideo = secondsPastTheHour - video.startTime;
        }
        consoleLog("- Found a video to play at timestamp...", timestampToStartVideo);
      }
    } else {
      consoleLog(`- The video ${video.fields.title} is missing its length, which will cause errors`);
    }
  });

  if (currentProgramBlock.programmingLength < secondsPastTheHour) {
    consoleLog("- The programming isn't even enough to get to this time in the hour!");
  }

  dispatch(setCurrentVideo(videos[videoToPlayIndex], videoToPlayIndex, timestampToStartVideo));
}

export const updateCurrentVideo = () => dispatch => {
  consoleLog("*** Getting the new video!");
  const currentProgramBlock = store.getState().programBlocks.currentProgramBlock;
  const videoPlayingIndex = currentProgramBlock.videoPlayingIndex;

  let newVideoIndex = videoPlayingIndex + 1;
  if (newVideoIndex >= currentProgramBlock.fields.videos.length) {
    consoleLog("- Either this was the last video and we're going back to the beginning, or this is the only video in this hour block");
    newVideoIndex = 0;
  }

  const newCurrentVideo = currentProgramBlock.fields.videos[newVideoIndex];
  const newTimestamp = newCurrentVideo.manualTimestamp ? newCurrentVideo.manualTimestamp : 0;

  dispatch(setCurrentVideo(newCurrentVideo, newVideoIndex, newTimestamp));
}

export const getCurrentProgramBlock = (programBlockId) => dispatch => {
  if (programBlockId === null) {
    return dispatch(setCurrentProgramBlock(null));
  }

  const savedProgramBlock = store.getState().programBlocks.loadedProgramBlocks.find(programBlock => {
    return programBlock.sys.id === programBlockId;
  })

  consoleLog("Getting current program block...");
  if (savedProgramBlock) {
    consoleLog("- Using a saved program block");
    dispatch(setCurrentProgramBlock(savedProgramBlock));
    dispatch(setupCurrentVideoAfterInitialLoad());
  } else {
    consoleLog("- Don't have this program block saved yet; fetching it now.");
    dispatch(fetchProgramBlock(programBlockId))
    .then(programBlock => {
      dispatch(setCurrentProgramBlock(programBlock));
    });
  }
}
