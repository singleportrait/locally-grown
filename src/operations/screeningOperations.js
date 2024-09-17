import client from '../servicesContentful';

import { setScreenings, setScreeningsError } from '../actions/screeningActions';

const fetchScreenings = () => dispatch => {
  return new Promise(function(resolve, reject) {
    client.getEntries({
      content_type: 'screening',
      'fields.isLive': process.env.NODE_ENV === `development` ? '' : true,
      include: 3
    }).then(screenings => {
      resolve(screenings.items);
    }, error => {
      dispatch(setScreeningsError(error));
      reject(error);
    });
  });
};

export const initializeScreenings = () => dispatch => {
  dispatch(fetchScreenings())
  .then(screenings => {
    dispatch(setScreenings(screenings));
  });
};
