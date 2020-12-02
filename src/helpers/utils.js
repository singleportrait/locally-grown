import TimeFormat from 'hh-mm-ss';
import spacetime from 'spacetime';

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

export const getGoogleCalendarShareUrl = (title, description = "", slug, startTime, endTime, useTimezone = false, customText = "") => {
  let spaceStartTime = spacetime(startTime);
  let spaceEndTime = spacetime(endTime);

  if (useTimezone) {
    const timezone = spacetime.now().timezone().name;
    spaceStartTime = spaceStartTime.goto(timezone);
    spaceEndTime = spaceEndTime.goto(timezone);
  }

  const URL = process.env.REACT_APP_DOMAIN + slug;

  const dateFormat = "{year}{iso-month}{date-pad}";
  const calStartDate = spaceStartTime.format(dateFormat);
  const calEndDate = spaceEndTime.format(dateFormat);

  const timeFormat = "{hour-24-pad}{minute-pad}";
  const calStartTime = spaceStartTime.format(timeFormat);
  const calEndTime = spaceEndTime.format(timeFormat);

  const detailsString = `${URL}

${title}

${description}

${customText}`;

  return `
http://www.google.com/calendar/event
?action=TEMPLATE
&text=${encodeURIComponent(title)}
&dates=${calStartDate}T${calStartTime}00/${calEndDate}T${calEndTime}00
&details=${encodeURIComponent(detailsString)}
&output=xml
&trp=false
&sprop=
&sprop=name:
`;

}
