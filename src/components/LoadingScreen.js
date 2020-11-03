import React from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';

import WhatIsThisTooltip from './WhatIsThisTooltip';

import { Logo, mobileViewportHeight } from '../styles';

const LoadingContainer = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  height: ${mobileViewportHeight};
  width: 100vw;
`;

function LoadingScreen(props) {
  return (
    <LoadingContainer>
      { props.showInitialLoadingState &&
        <>
          <Logo>&nbsp;</Logo>
          <h1>Loading Locally Grown...</h1>
        </>
      }
      { !props.showInitialLoadingState &&
        <>
          <Logo>Locally Grown</Logo>
          <h1>{props.message}</h1>
        </>
      }
      <br /><br />
      { props.showTVGuideLink &&
        <h4><Link to="/tv-guide">Find something to watch.</Link></h4>
      }
      { props.showWhatIsThisTooltip &&
        <WhatIsThisTooltip showLink={false} />
      }
      { !props.showTVGuideLink && !props.showWhatIsThisTooltip &&
        <h4>&nbsp;</h4>
      }
      <h4>&nbsp;</h4>
    </LoadingContainer>
  );
}

export default LoadingScreen;
