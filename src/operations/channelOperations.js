import clone from 'rfdc';

import { setChannels, setupChannels, errorLoadingChannels } from '../actions/channelActions';
import client from '../servicesContentful';
import store from '../store';
import consoleLog from '../helpers/consoleLog';
import { repeatProgramBlocks } from '../helpers/channelHelpers';

// import { channelsData } from '../data/channelsDataJune2020';

import * as moment from 'moment';

const dateFormat = "YYYY-MM-DD";

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

const configureChannels = (channels) => {
  const today = moment().format(dateFormat);

  // Configure copied channels
  const configuredChannels = clone()(channels).filter(channel => {
    // Filter out channels with no programs
    if (!channel.fields.programs) return false;

    return true;
  }).map(channel => {

    // Filter out programs with no fields, and ones that
    // aren't active for today
    const validPrograms = !channel?.fields?.programs ? [] : channel.fields.programs.filter(program => {
      return program.fields &&
        moment(program.fields.startDate, dateFormat).isSameOrBefore(today) &&
        moment(program.fields.endDate, dateFormat).isSameOrAfter(today);
    });
    // consoleLog(`Valid programs for channel ${channel.fields.title}:`, validPrograms);

    // If a program wants to repeat its blocks, we repeat them (regardless
    // of their original start time) until they fill 24 hours of programming
    // We have to run this separately than the today/tomorrow program blocks
    // code so that it has the updated repeated blocks first
    const configuredRepeatedPrograms = validPrograms.map(program => {

      if (program.fields.repeatProgramBlocks) {
        // consoleLog("- This program has repeated program blocks: ", program.fields.title);

        const repeatedProgramBlocks = repeatProgramBlocks(program.fields.programBlocks);

        // consoleLog(repeatedProgramBlocks);
        program.fields.programBlocks = repeatedProgramBlocks;
      }

      return program;
    });

    // If today's programming ends today, check other programs in this channel
    // to see if there's one tomorrow that pulls in different program blocks after midnight
    // And if there isn't one, end the programming at midnight
    configuredRepeatedPrograms.forEach(program => {
      // consoleLog("Configuring repeated programs", program);
      if (moment(program.fields.endDate, dateFormat).isSame(today)) {
        consoleLog(`- This program "${program.fields.title}" ends today`);
        // See if there's a program for tomorrow
        const tomorrow = moment().add(1, "day").format(dateFormat);

        const tomorrowsPrograms = channel.fields.programs.filter(program => {
          return moment(program.fields.startDate, dateFormat).isSame(tomorrow);
        });

        // TODO: Cheating by only using the first program, in case there is more than one match
        const tomorrowsProgram = tomorrowsPrograms[0];

        let tomorrowsProgramBlocks = [];

        // If there's a program tomorrow, and it has program blocks
        if (tomorrowsPrograms.length && tomorrowsProgram.fields.programBlocks?.length) {

          // Get tomorrow's program blocks until this time tomorrow
          tomorrowsProgramBlocks = tomorrowsProgram.fields.programBlocks.filter(programBlock => {
            return programBlock.fields.startTime < store.getState().session.currentHour;
          });
        }

        if (!tomorrowsPrograms.length) {
          consoleLog("- There's no programming tomorrow");
        }

        // Get the rest of today's program blocks
        const todaysProgramBlocks = program.fields.programBlocks.filter(programBlock => {
          return programBlock.fields.startTime >= store.getState().session.currentHour;
        });

        // Write over the initial program blocks with the correct ones post-midnight
        const combinedBlocks = todaysProgramBlocks.concat(tomorrowsProgramBlocks);
        // consoleLog("- Combined today + tomorrow's programming", combinedBlocks);
        program.fields.programBlocks = combinedBlocks;
      }
    });

    channel.fields.programs = configuredRepeatedPrograms;
    return channel;
  });

  consoleLog("Configured channels:", configuredChannels);
  return configuredChannels;
}

// This looks at all channels and finds the programs that are featured
const findFeaturedActiveChannels = (channels) => {

  // All these arrays need to be deep cloned (by rfdc) so that it doesn't keep
  // a reference to the original object.
  // TODO: Use normalized data and build brand spanking new objects!
  const featuredActiveChannels = clone()(channels).filter(channel => {

    // Include test channels if we're in development
    if (process.env.NODE_ENV !== `development`) {
      if (channel.fields.testChannel) {
        return false;
      }
    };

    // consoleLog("On channel", channel.fields.title, "there are:");
    // consoleLog("- These programs:", channel.fields.programs);

    // Earlier we filter out programs that aren't happening today, but here we
    // filter out programs that don't have any program blocks and aren't featured
    const featuredPrograms = channel.fields.programs.filter(program => {
      return program.fields.programBlocks && program.fields.featured === true;
    });

    // consoleLog("Featured available programs:", featuredPrograms);

    // TODO: If there are more than one featured & active program,
    // the links won't work correctly
    if (featuredPrograms.length > 1) {
      consoleLog("Warning, this channel has more than 1 active program. Expect bugginess.");
    }

    // We need to set the featured programs as the new correct channel programs
    channel.fields.programs = featuredPrograms;

    return featuredPrograms.length !== 0;
  });
  return featuredActiveChannels;
}

// This goes through all featured & active channels, and finds the ones
// that have program blocks for this current hour, for the previous/next
// channel functionality
const findCarouselChannels = (featuredActiveChannels) => {

  // Note: Deep-copied array
  const availableChannels = clone()(featuredActiveChannels).filter(channel => {

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
      consoleLog(`There are no available programs in ${channel.fields.title}, not including in keyboard carousel`);
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

// Quite literally:
// This looks at all channels and filters out the carousel ones
// in order to make all the routes for the site
// TODO: I don't know if this is *exactly* the logic we want, but it serves
// its purpose for now
const findNoncarouselChannels = (allChannels, availableChannels) => {
  const availableIds = availableChannels.map(channel => channel.sys.id);

  // Note: Deep-copied array
  const nonCarouselChannels = clone()(allChannels).filter(channel => {
    return !availableIds.includes(channel.sys.id);
  });

  return nonCarouselChannels;
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

  // Filter out empty programs, repeat program blocks,
  // filter out channels that don't have programs on today's date, and
  // ensure program blocks are correct if programming switches at midnight
  const configuredChannels = configureChannels(allChannels);

  // Go through each program and see if it's featured and has program blocks
  const featuredActiveChannels = findFeaturedActiveChannels(configuredChannels);

  // Go through each featured active program and see if there's a block for this hour
  const carouselChannels = findCarouselChannels(featuredActiveChannels);

  // Then, get the channels that AREN'T available
  // (so we can render them as their own route but not worry about next/previous)
  const nonCarouselChannels = findNoncarouselChannels(configuredChannels, carouselChannels);

  // Then, set the current channel and its info
  const currentChannel = getCurrentChannel(carouselChannels, dispatch);

  dispatch(setupChannels(featuredActiveChannels, carouselChannels, nonCarouselChannels, currentChannel));
}

export const initializeChannels = () => dispatch => {
  dispatch(fetchChannels())
  .then(channels => {
    findAndSetFeaturedChannels(channels, dispatch);
  });
}
