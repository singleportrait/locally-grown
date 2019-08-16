import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { css } from 'emotion';

const tvLink = css`
  opacity: .5;
  text-decoration: none;

  #closedEye {
    display: none;
  }

  @media (hover: hover) {
    &:hover #closedEye {
      display: inline-block;
    }

    &:hover #openEye {
      display: none;
    }
  }
`;

const eyeIcon = css`
  position: relative;
  top: 2px;
  margin-right: 5px;
`;

class TVGuideLink extends Component {
  render() {
    return (
      <Link
        to="/tv-guide"
        className={tvLink}
      >
        <svg id="closedEye" className={eyeIcon} width="15" height="15" xmlns="http://www.w3.org/2000/svg"><g stroke="#FFF" fill="none" fillRule="evenodd"><path d="M.466 7.202c1.145 2.924 3.807 4.974 6.909 4.974 3.11 0 5.778-2.06 6.917-4.995" strokeLinecap="round"/><path d="M6.296 12.157l-.531 1.984M3.823 11.275L2.8 13.055M1.966 9.742L.47 11.15M8.61 12.157l.531 1.984M11.083 11.275l1.023 1.78M12.94 9.742l1.496 1.408"/></g></svg>
        <svg id="openEye" className={eyeIcon} width="15" height="15" xmlns="http://www.w3.org/2000/svg"><g fill="#FFF" fillRule="evenodd"><path d="M7.41 12c-2.753 0-5.237-1.757-6.378-4.49C2.168 4.764 4.656 3 7.417 3c2.752 0 5.236 1.757 6.376 4.49C12.657 10.236 10.17 12 7.41 12zm7.382-4.708C13.534 4.077 10.638 2 7.417 2 4.185 2 1.287 4.086.034 7.314L0 7.401l.034.308C1.294 10.923 4.187 13 7.41 13c3.231 0 6.13-2.086 7.383-5.314l.034-.118-.034-.276z"/><path d="M7.47 4.49C5.816 4.5 4.46 5.86 4.466 7.507a3.032 3.032 0 0 0 3.013 3.012c1.646.002 3.01-1.36 3.013-3.01.002-1.657-1.374-3.032-3.02-3.02"/></g></svg>
        TV Guide
      </Link>
    );
  }
}

export default TVGuideLink;
