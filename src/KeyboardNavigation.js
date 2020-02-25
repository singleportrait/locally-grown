import React, { useEffect } from 'react';
import { useHistory } from "react-router-dom";

function KeyboardNavigation(props) {
  let history = useHistory();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.keyCode === 37) { // Left arrow
        history.push(props.previousChannelSlug);
      } else if (e.keyCode === 39) { // Right arrow
        history.push(props.nextChannelSlug);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    }
  });

  return (
    <React.Fragment />
  );
}

export default KeyboardNavigation;
