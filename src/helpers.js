import TimeFormat from 'hh-mm-ss';

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
    return TimeFormat.toS(time);
  }
}

export const currentSecondsPastTheHour = () => {
  const currentTime = new Date();
  const currentMinutes = currentTime.getMinutes();
  const currentSeconds = currentTime.getSeconds();

  return (currentMinutes * 60) + currentSeconds;
}
