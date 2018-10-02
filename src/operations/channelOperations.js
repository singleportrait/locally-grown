import { setChannels, setFeaturedChannels, setAvailableChannels, setHiddenChannels, setCurrentChannelInfo } from '../actions/channelActions';
import client from '../services-contentful';
import store from '../store';

const fetchChannels = () => dispatch => {
  return new Promise(function(resolve, reject) {
    client.getEntries({
      content_type: 'channel',
      include: 2
    }).then(channels => {
      dispatch(setChannels(channels.items));
      resolve(channels.items);
    }, error => {
      // Handle if channels fetch doesn't resolve
    });
  });
}

const findFeaturedLiveChannels = (channels) => {
  const today = new Date().setHours(0,0,0,0);
  const featuredLiveChannels = channels.filter(channel => {
    const featuredPrograms = channel.fields.programs.filter(program => {
      const parsedStartDate = Date.parse(program.fields.startDate.replace(/-/g, " "));
      const parsedEndDate = Date.parse(program.fields.endDate.replace(/-/g, " "));
      return program.fields.featured === true &&
        parsedStartDate <= today &&
        parsedEndDate >= today;
    });
    // console.log("Featured programs:", featuredPrograms);
    return featuredPrograms.length !== 0;
  });
  return featuredLiveChannels;
}

const findAvailableChannels = (channels) => {
  // This is all because this code was ALSO updating the original variable's objects
  // because cloning objects is a no-no...but I need help with my store shape
  const copiedChannels = [];
  channels.forEach(channel => {
    const copy = Object.assign({}, channel);
    copiedChannels.push(copy);
  });

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
  const availableIds = availableChannels.map(channel => channel.sys.id);

  const hiddenChannels = allChannels.filter(channel => {
    return !availableIds.includes(channel.sys.id);
  });

  return hiddenChannels;
}

const setCurrentChannel = (channels, dispatch) => {
  const channelsTotal = channels.length;
  const randomChannelIndex = Math.floor(Math.random()*channelsTotal);

  const currentChannel = channels[randomChannelIndex];

  dispatch(setCurrentChannelInfo(currentChannel));
}

const findAndSetFeaturedChannels = (allChannels, dispatch) => {
  // Go through each program and see if it's featured & is active on today's date
  const featuredLiveChannels = findFeaturedLiveChannels(allChannels);
  dispatch(setFeaturedChannels(featuredLiveChannels));

  // Go through each program and see if there's a block for this hour
  const availableChannels = findAvailableChannels(featuredLiveChannels);
  dispatch(setAvailableChannels(availableChannels));

  // Then, get the channels that AREN'T available
  // (so we can render them as their own route but not worry about next/previous)
  const hiddenChannels = findHiddenChannels(allChannels, availableChannels);
  dispatch(setHiddenChannels(hiddenChannels));
  // Then, set the current channel and its info
  setCurrentChannel(availableChannels, dispatch);
}

export const initializeChannels = () => dispatch => {
  dispatch(fetchChannels())
  .then(channels => {
    findAndSetFeaturedChannels(channels, dispatch);
  });
}
