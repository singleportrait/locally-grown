let mobileViewportHeight = window.innerHeight;
let mobileViewportWidth = window.innerWidth;

export const calculateWindowSize = () => {
  let pageAngle = window.orientation;
  console.log(window.orientation);
  console.log("Page angle:", pageAngle);
  if (pageAngle === 90) { // Horizontal screen
    console.log("horizontal screen");
    mobileViewportHeight = window.innerWidth;
    mobileViewportWidth = window.innerHeight;
  } else if (pageAngle === 0) { // Vertical screen
    console.log("vertical screen");
    mobileViewportHeight = window.innerHeight;
    mobileViewportWidth = window.innerWidth;
  }
}

mobileViewportHeight += "px";
mobileViewportWidth += "px";

// export const mobileViewportHeightX = mobileViewportHeight;
// export const mobileViewportWidthX = mobileViewportWidth;

export const mobileViewportHeightX = (window.orientation === 0 ? window.innerHeight : window.innerWidth) + "px";
export const mobileViewportWidthX = (window.orientation === 0 ? window.innerWidth : window.innerHeight) + "px";
