import React, { useState, useEffect } from 'react';
import pluralize from 'pluralize';

import { calculateTimeLeft } from '../helpers/utils';

function ScreeningCountdown(props) {
  /* Custom hook for calculating various countdowns */
  const useExpired = (time, beforeState, afterState, delay = 1000, customCheck = null) => {
    const [expired, setExpired] = useState();
    useEffect(() => {
      if (props.screeningState !== beforeState) return;
      if (customCheck) customCheck();

      if (!expired) {
        setExpired(calculateTimeLeft(time));
      }

      const timeoutRef = setTimeout(() => {
        const timeLeft = calculateTimeLeft(time);
        // console.log("Time left", timeLeft);
        if (timeLeft.complete) {
          clearTimeout(timeoutRef);
          props.setScreeningState(afterState);
          return false;
        }
        setExpired(timeLeft);
      }, delay);
      return () => clearTimeout(timeoutRef);
    }, [expired, time, beforeState, afterState, delay, customCheck]);
    return expired;
  }

  /* For some reason, spacetime's stateTime won't work here, but using the
   * proper Date() does work, no matter the time zone */
  const dateTime = new Date(props.startDatetime);

  /* Run timer every minute if we're more than a day away; run every second if we're sooner */
  const preshowTimerDelay = calculateTimeLeft(dateTime).days > 0 ? 1000 * 60 : 1000;
  const timeLeftUntilScreening = useExpired(dateTime, "preshow", "trailer", preshowTimerDelay);

  const customCheck = () => {
    if (!props.preScreeningVideo || !props.preScreeningVideoLength) {
      // console.log("This screening doesn't have a pre-screening video");
      props.setScreeningState("live");
      return;
    }
  }

  const timeLeftUntilLive = useExpired(props.liveTime, "trailer", "live", 1000, customCheck);

  const finishedTime = new Date(props.endDatetime);
  const timeUntilFinished = useExpired(finishedTime, "live", "finished", 1000 * 60);

  return (
    <>
      { props.screeningState === "preshow" && timeLeftUntilScreening &&
        <>
          { timeLeftUntilScreening.days > 0 &&
            <>
              Starting in { timeLeftUntilScreening.days } { pluralize('day', timeLeftUntilScreening.days)}
              {timeLeftUntilScreening.hours !== "00" && `, ${parseInt(timeLeftUntilScreening.hours)} ${pluralize('hour', parseInt(timeLeftUntilScreening.hours))}`}
              { timeLeftUntilScreening.minutes !== "00" && ` and ${parseInt(timeLeftUntilScreening.minutes)} ${pluralize('minute', parseInt(timeLeftUntilScreening.minutes))}` }
            </>
          }
          { timeLeftUntilScreening.days === 0 &&
            <>Starting in: { timeLeftUntilScreening.hours }:{ timeLeftUntilScreening.minutes }:{ timeLeftUntilScreening.seconds }</>
          }
        </>
      }
      { props.screeningState === "trailer" && timeLeftUntilLive &&
        <>
          Film starts in { timeLeftUntilLive.hours }:{ timeLeftUntilLive.minutes }:{ timeLeftUntilLive.seconds }
        </>
      }
    </>
  );
}

export default ScreeningCountdown;
