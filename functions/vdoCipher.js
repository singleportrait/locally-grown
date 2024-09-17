const functions = require('firebase-functions');
const axios = require('axios');

exports.getOTPAndPlaybackInfo = functions.https.onCall((data, context) => {
  // console.log(data.videoId);
  if (!data.videoId) return;

  // Fetch API endpoint and return code to user
  return axios
    .post(`https://dev.vdocipher.com/api/videos/${data.videoId}/otp`, {}, {
      headers: {
        'Authorization': `Apisecret ${process.env.VDOCIPHER_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    }).then(response => {
      // console.log("Got a response", response.data);
      return response.data;
    }).catch(error => {
      functions.logger.error("Error fetching VdoCipher info", error);
    });
});
