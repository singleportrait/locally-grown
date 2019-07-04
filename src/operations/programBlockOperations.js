import { setCurrentProgramBlock, addProgramBlock, setCurrentVideo, programBlockError } from '../actions/programBlockActions';
import store from '../store';
import consoleLog from '../consoleLog';

import { shuffleArray, convertTimeToSeconds, currentSecondsPastTheHour } from '../helpers';

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
  consoleLog("- Initializing program block", currentProgramBlock.fields.title);
  return new Promise(function(resolve, reject) {
    let videos = currentProgramBlock.fields.videos;

    if (currentProgramBlock.fields.isRandom) {
      consoleLog("- This program block is random.");
      videos = shuffleArray(videos);
    }

    let programmingLength = 0;
    const secondsPastTheHour = currentSecondsPastTheHour();
    // consoleLog("- Seconds past the hour: " + secondsPastTheHour);
    let videoToPlayIndex = 0;
    let timestampToStartVideo = 0;
    let videosLength = videos.length;

    if (!videos) {
      consoleLog("No videos!");
      const loadedProgramBlock = {
        sys: currentProgramBlock.sys,
        fields: currentProgramBlock.fields
      }
      return dispatch(programBlockError(loadedProgramBlock, "Warning: This program doesn't have any videos!"));
    }

    // Set individual video lengths & full programming length
    videos.forEach((video, i) => {
      if ('length' in video.fields) {
        const videoLengthInSeconds = convertTimeToSeconds(video.fields.length);
        video.lengthInSeconds = videoLengthInSeconds;

        // Calculate the video info differently if it starts at a custom timestamp
        if (video.fields.customStartTimestamp) {
          const manualTimestamp = convertTimeToSeconds(video.fields.customStartTimestamp);
          if (manualTimestamp === 0) {
            consoleLog(`- The video ${video.fields.title} has a custom timestamp, but it was in a weird format so we're not using it.`);
          } else {
            consoleLog("- Converting and saving custom start time");
            video.lengthInSeconds = videoLengthInSeconds - manualTimestamp;
            video.manualTimestamp = manualTimestamp;
          }
        }

        video.startTime = programmingLength;
        video.endTime = programmingLength + video.lengthInSeconds;
        video.index = i;

        if ((programmingLength < secondsPastTheHour && video.endTime > secondsPastTheHour) || secondsPastTheHour === 0) {
          videoToPlayIndex = i;

          timestampToStartVideo = secondsPastTheHour - programmingLength;
          if (video.manualTimestamp) {
            consoleLog("- Using custom start time in initializeCurrentProgramBlockVideos");
            timestampToStartVideo = timestampToStartVideo + video.manualTimestamp;
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
      let i = 0;
      while (programmingLength < 3600) {
        const newVideo = JSON.parse(JSON.stringify(videos[i]));
        // Calculate start & end time for new copied video
        newVideo.startTime = programmingLength;
        newVideo.endTime = programmingLength + newVideo.lengthInSeconds;
        newVideo.index = videos.length + 1;
        videos.push(newVideo);

        if (programmingLength < secondsPastTheHour && newVideo.endTime > secondsPastTheHour) {
          videoToPlayIndex = videos.length - 1;

          timestampToStartVideo = secondsPastTheHour - programmingLength;
          if (newVideo.manualTimestamp) {
            consoleLog("- Using custom start time when repeating videos");
            timestampToStartVideo = timestampToStartVideo + newVideo.manualTimestamp;
          }
        }

        programmingLength += newVideo.lengthInSeconds;
        if (i === 0 || i < videosLength) {
          i++;
        } else {
          i = 0;
        }
      }

      // consoleLog(videos);
      // consoleLog(programmingLength);
    }

    if (programmingLength < secondsPastTheHour) {
      consoleLog("- The programming isn't even enough to get to this time in the hour!");
    }

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
  // consoleLog("Updating current video info after switching channels; setupCurrentVideoAfterInitialLoad()");
  const currentProgramBlock = store.getState().programBlocks.currentProgramBlock;
  const secondsPastTheHour = currentSecondsPastTheHour();
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
  // consoleLog("*** Getting the new video!");
  const currentProgramBlock = store.getState().programBlocks.currentProgramBlock;
  const videoPlayingIndex = currentProgramBlock.videoPlayingIndex;

  let newVideoIndex = videoPlayingIndex + 1;
  if (newVideoIndex >= currentProgramBlock.fields.videos.length) {
    consoleLog("This was the last video! Going back to the beginning");
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
