import client from '../servicesContentful';

import { setEvents, setEventsError } from '../actions/eventActions';

const fetchEvents = () => dispatch => {
  return new Promise(function(resolve, reject) {
    client.getEntries({
      content_type: 'event',
      include: 3
    }).then(events => {
      resolve(events.items);
    }, error => {
      dispatch(setEventsError(error));
      reject(error);
    });
  });
};

export const initializeEvents = () => dispatch => {
  dispatch(fetchEvents())
  .then(events => {
    dispatch(setEvents(events));
  });
};
