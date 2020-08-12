import { setChannels, setupChannels, errorLoadingChannels } from '../actions/channelActions';
import client from '../services-contentful';
import store from '../store';
import consoleLog from '../helpers/consoleLog';

// import { channelsData } from '../data/channelsDataJune2020';

import * as moment from 'moment';

const fetchChannels = () => dispatch => {
  // Can use this when working offline
  // return new Promise(function(resolve, reject) {
  //   consoleLog("Running from local data");
  //   // consoleLog(JSON.stringify(channelsData));
  //   dispatch(setChannels(channelsData));
  //   resolve(channelsData);
  // });

  return new Promise(function(resolve, reject) {
    client.getEntries({
      content_type: 'channel',
      include: 3
    }).then(channels => {
      // Can use this to grab the current Contentful data
      // consoleLog(JSON.stringify(channels.items));
      dispatch(setChannels(channels.items));
      resolve(channels.items);
    }, error => {
      dispatch(errorLoadingChannels());
      reject(error);
    });
  });
}

// This looks at all channels and finds the programs that are featured and
// "on" for today's current date
const findFeaturedLiveChannels = (channels) => {
  const today = moment().format("YYYY-MM-DD");

  // This is all because this code was ALSO updating the original variable's objects
  // because cloning objects is a no-no...but I need help with my store shape
  const copiedChannels = JSON.parse(JSON.stringify(channels));

  const featuredLiveChannels = copiedChannels.filter(channel => {

    // Include test channels if we're in development
    if (process.env.NODE_ENV !== `development`) {
      if (channel.fields.testChannel) {
        return false;
      }
    };

    // consoleLog("On channel", channel.fields.title, "there are:");
    // consoleLog("- These programs:", channel.fields.programs);

    const featuredPrograms = channel.fields.programs.filter(program => {
      if (!program.fields) {
        return false;
      }

      if (!program.fields.programBlocks) {
        consoleLog("Didn't find any program blocks in", program.fields.title, ", not including in featuredPrograms");
        return false;
      }

      // If today's programming ends today, check other programs in this channel
      // to see if there's one tomorrow that should pull in different program blocks after midnight
      // And if there isn't one, end the programming at midnight
      //
      // TODO: We shouldn't worry about running this block unless the program is featured
      // and we know it is active today
      if (moment(program.fields.endDate, "YYYY-MM-DD").isSame(today)) {
        consoleLog(`This program "${program.fields.title}" ends today`);
        // See if there's a program for tomorrow
        const tomorrow = moment().add(1, "day").format("YYYY-MM-DD");

        const tomorrowsPrograms = channel.fields.programs.filter(program => {
          return moment(program.fields.startDate, "YYYY-MM-DD").isSame(tomorrow);
        });

        // Cheating by only using the first one, in case there is more than one match
        const tomorrowsProgram = tomorrowsPrograms[0];

        let tomorrowsProgramBlocks = [];

        // If there's a program tomorrow, and it has program blocks
        if (tomorrowsPrograms.length && tomorrowsProgram.fields.programBlocks?.length) {
          consoleLog("- Tomorrow's program for this channel", tomorrowsProgram);

          // Get tomorrow's program blocks until this time tomorrow
          tomorrowsProgramBlocks = tomorrowsProgram.fields.programBlocks.filter(programBlock => {
            return programBlock.fields.startTime < store.getState().session.currentHour;
          });
          consoleLog("- Tomorrow's program blocks ", tomorrowsProgramBlocks);
        }

        if (!tomorrowsPrograms.length) {
          consoleLog("- There's no programming tomorrow");
        }

        // Get the rest of today's program blocks
        const todaysProgramBlocks = program.fields.programBlocks.filter(programBlock => {
          return programBlock.fields.startTime >= store.getState().session.currentHour;
        });
        consoleLog("- Today's program blocks ", todaysProgramBlocks);

        // Write over the initial program blocks with the correct ones post-midnight
        program.fields.programBlocks = todaysProgramBlocks.concat(tomorrowsProgramBlocks);
      }

      // If program is featured, starts today or earlier, and ends today or later
      return program.fields.featured === true &&
        moment(program.fields.startDate, "YYYY-MM-DD").isSameOrBefore(today) &&
        moment(program.fields.endDate, "YYYY-MM-DD").isSameOrAfter(today);
    });

    // consoleLog("Featured available programs:", featuredPrograms);

    // TODO: If there are more than one featured & active program,
    // the links won't work correctly
    if (featuredPrograms.length > 1) {
      consoleLog("Warning, this channel has more than 1 active program. Expect bugginess.");
    }

    // We need to set the featured programs as the new correct programs
    // for the channel
    channel.fields.programs = featuredPrograms;

    return featuredPrograms.length !== 0;
  });
  return featuredLiveChannels;
}

// This looks at all channels and finds the ones that have program blocks
// for this current hour, regardless of whether they are featured or active.
const findAvailableChannels = (channels) => {

  // Same reasoning as above for findFeaturedLiveChannels
  const copiedChannels = JSON.parse(JSON.stringify(channels));

  const availableChannels = copiedChannels.filter(channel => {

    // Return programs that have program blocks for this hour.
    const availablePrograms = channel.fields.programs.filter(program => {
      if (!program.fields.programBlocks) {
        consoleLog("Didn't find any program blocks in", program.fields.title, ", not including in availablePrograms");
        return false;
      }

      const availableProgramBlocks = program.fields.programBlocks.filter(programBlock => {
        return programBlock.fields.startTime === store.getState().session.currentHour;
      });
      // consoleLog("Available program blocks:", availableProgramBlocks);
      return availableProgramBlocks.length !== 0;
    });

    if (availablePrograms.length > 1) {
      consoleLog("There are multiple available programs for this channel!");
    }
    if (availablePrograms.length === 0) {
      consoleLog("There are no program blocks in this");
      return false;
    }
    channel.fields.programs = availablePrograms;
    return availablePrograms.length !== 0;
  });

  // Set previous & next channel slugs on the channel itself
  const availableChannelsTotal = availableChannels.length;
  if (availableChannelsTotal > 1) {
    availableChannels.forEach((channel, i) => {
      const previousChannelIndex = i - 1 < 0 ? availableChannelsTotal - 1 : i - 1;
      const nextChannelIndex = i + 1 < availableChannelsTotal ? i + 1 : 0;

      channel.previousChannelSlug = availableChannels[previousChannelIndex].fields.slug;
      channel.nextChannelSlug = availableChannels[nextChannelIndex].fields.slug;
    });
  }

  return availableChannels;
}

const findHiddenChannels = (allChannels, availableChannels) => {
  // TODO: These probably shouldn't populate programs that aren't happening currently, either.
  // Should use the date checks from above in findFeaturedLiveChannels() to filter these out too.
  const availableIds = availableChannels.map(channel => channel.sys.id);
  const copiedAllChannels = JSON.parse(JSON.stringify(allChannels));

  const hiddenChannels = copiedAllChannels.filter(channel => {
    return !availableIds.includes(channel.sys.id);
  });

  return hiddenChannels;
}

// Pick a random channel of all featured and active channels, to show on landing
const getCurrentChannel = channels => {
  const channelsTotal = channels.length;
  const randomChannelIndex = Math.floor(Math.random()*channelsTotal);

  const currentChannel = channels[randomChannelIndex];

  return currentChannel;
}

// Set up the channels objects
export const findAndSetFeaturedChannels = (allChannels, dispatch) => {
  // Go through each program and see if it's featured & is active on today's date
  const featuredLiveChannels = findFeaturedLiveChannels(allChannels);

  // Go through each program and see if there's a block for this hour
  // TODO: This finds the right programs, but doesn't put them into the store
  const availableChannels = findAvailableChannels(featuredLiveChannels);

  // Then, get the channels that AREN'T available
  // (so we can render them as their own route but not worry about next/previous)
  const hiddenChannels = findHiddenChannels(allChannels, availableChannels);

  // Then, set the current channel and its info
  const currentChannel = getCurrentChannel(availableChannels, dispatch);

  dispatch(setupChannels(featuredLiveChannels, availableChannels, hiddenChannels, currentChannel));
}

export const initializeChannels = () => dispatch => {
  dispatch(fetchChannels())
  .then(channels => {
    findAndSetFeaturedChannels(channels, dispatch);
  });
}
