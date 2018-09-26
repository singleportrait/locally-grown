import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import styled from 'react-emotion';

const TVGuideWrapper = styled('div')`
  position: absolute;
  width: 60vw;
  height: 60vh;
  top: 20vh;
  left: 20vw;
  background-color: #333;
`;

class TVGuide extends Component {
  render() {
    return (
      <TVGuideWrapper>
        <h1>TV Guide</h1>
        <Link to="/">Back (Close)</Link>
      </TVGuideWrapper>
    );
  }
}

export default TVGuide;
