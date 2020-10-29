import React, { useEffect } from 'react';
import { useHistory } from "react-router-dom";

function KeyboardNavigation(props) {
  let history = useHistory();
  const { preventNavigation, previousChannelSlug, nextChannelSlug } = props;

  useEffect(() => {
    console.log("[Adding key listeners]");
    const handleKeyDown = (e) => {
      if (!preventNavigation) {
        if (e.keyCode === 37) { // Left arrow
          history.push(previousChannelSlug);
        } else if (e.keyCode === 39) { // Right arrow
          history.push(nextChannelSlug);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    }
  }, [preventNavigation, previousChannelSlug, nextChannelSlug, history]);

  return (
    <React.Fragment />
  );
}

export default KeyboardNavigation;
