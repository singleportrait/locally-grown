import { setChannels, setFeaturedChannels, setAvailableChannels } from '../actions/channelActions';
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
  const availableChannels = channels.filter(channel => {
    const availablePrograms = channel.fields.programs.filter(program => {
      const availableProgramBlocks = program.fields.programBlocks.filter(programBlock => {
        return programBlock.fields.startTime === store.getState().session.currentHour;
      });
      return availableProgramBlocks.length !== 0;
    });
    if (availablePrograms.length > 1) {
      console.log("There are multiple available programs for this channel!");
    }
    return availablePrograms.length !== 0;
  });
  return availableChannels;
}

const findAndSetFeaturedChannels = (channels, dispatch) => {
  // Go through each program and see if it's featured
  // and is active currently in time
  const featuredLiveChannels = findFeaturedLiveChannels(channels);
  // console.log("Featured, live channels:", featuredLiveChannels);

  // Go through each program and see if there's a block for this hour
  const availableChannels = findAvailableChannels(featuredLiveChannels);
  // console.log("Available channels:", availableChannels);

  dispatch(setFeaturedChannels(featuredLiveChannels));
  dispatch(setAvailableChannels(availableChannels));
}

export const initializeChannels = () => dispatch => {
  dispatch(fetchChannels())
    .then(channels => {
      findAndSetFeaturedChannels(channels, dispatch);
    });
}
