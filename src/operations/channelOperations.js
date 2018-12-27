import { setChannels, setupChannels, errorLoadingChannels } from '../actions/channelActions';
import client from '../services-contentful';
import store from '../store';

// import { channelsData } from '../channelsData';

import * as moment from 'moment';

const fetchChannels = () => dispatch => {
  return new Promise(function(resolve, reject) {
    client.getEntries({
      content_type: 'channel',
      include: 3
    }).then(channels => {
      // console.log(JSON.stringify(channelsData));
      // console.log(JSON.stringify(channels.items));
      dispatch(setChannels(channels.items));
      // dispatch(setChannels(channelsData));
      resolve(channels.items);
    }, error => {
      dispatch(errorLoadingChannels());
      reject(error);
    });
  });
}

const findFeaturedLiveChannels = (channels) => {
  const today = moment().format("YYYY-MM-DD");
  const featuredLiveChannels = channels.filter(channel => {
    const featuredPrograms = channel.fields.programs.filter(program => {
      if (!program.fields) {
        return false;
      }

      return program.fields.featured === true &&
        moment(program.fields.startDate, "YYYY-MM-DD").isSameOrBefore(today) &&
        moment(program.fields.endDate, "YYYY-MM-DD").isSameOrAfter(today);
    });
    // console.log("Featured available programs:", featuredPrograms);
    return featuredPrograms.length !== 0;
  });
  return featuredLiveChannels;
}

const findAvailableChannels = (channels) => {
  // This is all because this code was ALSO updating the original variable's objects
  // because cloning objects is a no-no...but I need help with my store shape
  const copiedChannels = JSON.parse(JSON.stringify(channels));

  const availableChannels = copiedChannels.filter(channel => {
    const availablePrograms = channel.fields.programs.filter(program => {
      const availableProgramBlocks = program.fields.programBlocks.filter(programBlock => {
        return programBlock.fields.startTime === store.getState().session.currentHour;
      });
      return availableProgramBlocks.length !== 0;
    });
    if (availablePrograms.length > 1) {
      console.log("There are multiple available programs for this channel!");
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
