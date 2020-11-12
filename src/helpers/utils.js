import TimeFormat from 'hh-mm-ss';
// import consoleLog from './consoleLog';

const consoleLog = (...args) => console.log(...args);

export const shuffleArray = array => {
  var currentIndex = array.length
    , temporaryValue
    , randomIndex
  ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

export const convertTimeToSeconds = time => {
  if (time) {
    try {
      return TimeFormat.toS(time);
    } catch (e) {
      consoleLog("Error calculating the time", time, e);
      return 0;
    }
  }
}

export const currentSecondsPastTheHour = () => {
  const currentTime = new Date();
  const currentMinutes = currentTime.getMinutes();
  const currentSeconds = currentTime.getSeconds();

  return (currentMinutes * 60) + currentSeconds;
}

export const calculateSecondsUntilNextProgram = () => {
  const oneHourInSeconds = 60 * 60;
  let secondsUntilNextProgram = oneHourInSeconds - currentSecondsPastTheHour();

  if (secondsUntilNextProgram < 0) {
    secondsUntilNextProgram = 3600;
  }

  return secondsUntilNextProgram;
}

/**
 * Calculate how much time is left until a given time
 * `endTime`: Date
 */
export const calculateTimeLeft = (endTime) => {
  let difference = endTime - +new Date();
  let timeLeft = {};

  if (difference > 1000) { // In milliseconds
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24).toString().padStart(2, '0'),
      minutes: Math.floor((difference / 1000 / 60) % 60).toString().padStart(2, '0'),
      seconds: Math.floor((difference / 1000) % 60).toString().padStart(2, '0')
    };
  } else {
    // console.log("Time's up!");
    timeLeft = { complete: true }
  }

  return timeLeft;
}

/**
 * Determine if the user is on iOS
 * Inspired by: https://stackoverflow.com/questions/21741841/detecting-ios-android-operating-system
 *
 * @returns {boolean}
 */
export const isIOS = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // iOS detection from: http://stackoverflow.com/a/9039885/177710
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return true;
  }

  return false;
}
