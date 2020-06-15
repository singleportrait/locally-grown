import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import styled from '@emotion/styled';
import { css } from 'emotion';

import * as moment from 'moment';

import CloseIcon from './components/CloseIcon';
import WhatIsThisTooltip from './components/WhatIsThisTooltip';
import TVGuideProgramBlock from './components/TVGuideProgramBlock';

import {
  Header, programBlockBase,
  brandColor, alternatingBackgroundColor, borderColor
} from './styles';

function TVGuide(props) {
  const goBack = () => {
    // TODO: What happens if I come directly to the TV Guide?
    // I need to check if the browser history is this domain,
    // and if it's not (or doesn't exist) go back to '/'
    // Can probably use props.history.location.pathname
    props.history.goBack();
  }

  let hours = [];
  const currentHour = props.session.currentHour;
  for (let i = currentHour; i < 24; i++) {
    hours.push(i);
  }
  if (currentHour !== 0) {
    for (let i = 0; i < currentHour; i++) {
      hours.push(i);
    }
  }

    // TODO: Figure out a better way to know if NONE of
    // the program blocks match

  return (
    <TVGuideWrapper>
      <TVGuidePageHeader>
        <WhatIsThisTooltip />
        <h2>TV Guide</h2>
        <div onClick={goBack} className={closeButton}>
          <CloseIcon />
        </div>
      </TVGuidePageHeader>
      <hr/>

      { props.channels.length === 0 &&
        <h2>Uh oh! There aren&apos;t any featured programs with active programming right now. Come back later!</h2>
      }

      <HeaderRow>
        <ChannelTitleContainer>
          <div className={channelTitle}></div>
        </ChannelTitleContainer>
        { hours.map((hour, i) =>
          <Column key={i} headerRow>
            <ProgramBlockHour><h4>{moment(hour, "HH").format("ha")}</h4></ProgramBlockHour>
          </Column>
        )}
      </HeaderRow>

      { props.channels.map((channel) => channel.fields.programs.map((program, i) =>
        <Row key={i}>
          <ChannelTitleContainer>
            <Link to={channel.fields.slug} className={channelTitle} style={{textDecoration: "none"}}>
              <h3>{program.fields.title}</h3>
              { channel.fields.user &&
                <p className={channelTitleName}>{channel.fields.user.fields.name}</p>
              }
            </Link>
          </ChannelTitleContainer>
          { hours.map((hour, i) =>
            <React.Fragment key={i}>
              {program.fields.programBlocks.find(programBlock => programBlock.fields.startTime === hour) &&
                <Column>
                  {hours[0] === hour &&
                    <Link to={channel.fields.slug} className={programBlockLink}>
                      <TVGuideProgramBlock
                        firstHour={true}
                        programBlock={program.fields.programBlocks.find(programBlock => programBlock.fields.startTime === hour)}
                        channelSlug={channel.fields.slug}
                        channelTitle={channel.fields.title}
                      />
                    </Link>
                  }
                  {hours[0] !== hour &&
                    <TVGuideProgramBlock
                      programBlock={program.fields.programBlocks.find(programBlock => programBlock.fields.startTime === hour)}
                      channelSlug={channel.fields.slug}
                      channelTitle={channel.fields.title}
                    />
                  }
                </Column>
              }
              {!program.fields.programBlocks.find(programBlock => programBlock.fields.startTime === hour) &&
                <Column>
                  <EmptyProgramBlock title="No programming for this hour">
                    <CloseIcon />
                  </EmptyProgramBlock>
                </Column>
              }
            </React.Fragment>
          )}
        </Row>
      ))}
    </TVGuideWrapper>
  );
}

const mobileBreakpoint = "415px";

const TVGuideWrapper = styled('div')`
  // We have to set the full width of this container in order for "position: sticky" to work properly
  // Title block + hour blocks w margins + 1rem right page padding - 5px final hour right margin
  width: ${225+(210*24)+16-5}px;

  @media screen and (max-width: ${mobileBreakpoint}) {
    // Narrower title block
    width: ${155+(210*24)+16-5}px;
  }
`;

const TVGuidePageHeader = styled(Header)`
  padding: 1rem 1rem 0;
  position: sticky;
  left: 0px;
  width: 100vw;
`;

const closeButton = css`
  padding: 1rem 1rem 0;
  cursor: pointer;
`;

const Row = styled('div')`
  margin: 0 1rem;
  display: flex;
  position: relative;
  align-items: stretch;
  border-bottom: 1px solid ${borderColor};
`;

const Column = styled('div')`
  ${props => !props.headerRow && "padding: 1.2rem 0;"}
  display: flex;
  justify-content: center;
  align-items: center;

  &:nth-of-type(odd) {
    background-color: ${alternatingBackgroundColor};
  }
`;

const HeaderRow = styled(Row)`
  padding: 0;
  z-index: 2;
  position: sticky;
  top: 0px;
  background-color: ${brandColor};
`;

const ChannelTitleContainer = styled('div')`
  display: flex;
  position: sticky;
  left: 1rem;
  z-index: 1;
`;

const channelTitle = css`
  width: 220px;
  margin-right: 5px;
  padding: 0 1rem;
  margin-left: -1rem;
  flex-shrink: 0;
  min-height: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  // Using Hex method to change opacity
  background-color: ${brandColor}f0;

  @media screen and (max-width: ${mobileBreakpoint}) {
    width: 150px;
    padding-right: .5rem;
  }
`;

const channelTitleName = css`
  margin: 0;
`;

const ProgramBlockHour = styled('div')`
  ${programBlockBase};
  font-weight: 500;
  font-size: 15px;
`;

const programBlockLink = css`
  text-decoration: none;
`;

const EmptyProgramBlock = styled('div')`
  ${programBlockBase};
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: .4;
`;

const mapStateToProps = state => ({
  session: state.session
});

export default connect(mapStateToProps)(TVGuide);
