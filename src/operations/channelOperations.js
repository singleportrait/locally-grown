import { setChannels, setupChannels, errorLoadingChannels } from '../actions/channelActions';
import client from '../services-contentful';
import store from '../store';
import consoleLog from '../consoleLog';

import { normalize, schema } from 'normalizr';
// import { channelsData } from '../channelsDataAug2019';

import * as moment from 'moment';

const normalizeData = () => {
  // Finally got this working. Found the working code in this repo:
  // https://github.com/Vizzuality/care_usa/blob/f4708f1d3a5ba4f957f97bdadd86a246b128de14/stories/src/components/filters/filters.duck.js
  // https://github.com/Vizzuality/care_usa/blob/f4708f1d3a5ba4f957f97bdadd86a246b128de14/stories/src/schemas.js
  //
  // Docs:
  // https://github.com/paularmstrong/normalizr
  const processContentfulSchema = {
    idAttribute: value => value.sys.id,
    processStrategy: value => ({ ...value.fields })
  }

  const video = new schema.Entity('videos', { }, processContentfulSchema);

  const programBlock = new schema.Entity('programBlocks', {
    videos: [video]
  }, processContentfulSchema);

  const program = new schema.Entity('programs', {
    programBlocks: [programBlock]
  }, processContentfulSchema);

  const channel = new schema.Entity('channels', {
    programs: [program]
  }, processContentfulSchema);

  const entries = client.getEntries({
    content_type: "channel",
    include: 3,
  }).then(entries => {
    const normalizedData = normalize(entries.items, [channel]);

    // consoleLog("Normalized data", normalizedData);

    // Can call this like:
    // normalizedData.entities.channels["2HdrJ1Rqhyq0IwQYouGiAA"];
    // normalizedData.entities.channels[channelId]

    // To find and edit all program blocks for a program, for instance:
    // normalizedData.entities.programs["1jc00QwzEFcAH310GMvZnh"].programBlocks.forEach((programBlockId, i) => {
    //   const foundProgramBlock = normalizedData.entities.programBlocks[programBlockId];
    //   foundProgramBlock.index = i;
    //   consoleLog(foundProgramBlock);
    // });
  });
};

normalizeData();

const fetchChannels = () => dispatch => {
  // Can use this when working offline
  // return new Promise(function(resolve, reject) {
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

const getCurrentChannel = channels => {
  const channelsTotal = channels.length;
  const randomChannelIndex = Math.floor(Math.random()*channelsTotal);

  const currentChannel = channels[randomChannelIndex];

  return currentChannel;
}

const findAndSetFeaturedChannels = (allChannels, dispatch) => {
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
