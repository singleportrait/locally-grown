import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import styled from '@emotion/styled';
import { css } from 'emotion';

import * as moment from 'moment';

import CloseIcon from './CloseIcon';
import WhatIsThisTooltip from './WhatIsThisTooltip';
import TVGuideProgramBlock from './TVGuideProgramBlock';

import { Header, programBlockBase } from './styles';

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
      <Header>
        <WhatIsThisTooltip />
        <h2>TV Guide</h2>
        <div onClick={goBack} className={closeButton}>
          <CloseIcon />
        </div>
      </Header>
      <hr/>
      { props.channels.length === 0 &&
        <h2>Uh oh! There aren&apos;t any featured programs with active programming right now. Come back later!</h2>
      }

      <TVGuideChart>
        <Row>
          <ProgramTitle></ProgramTitle>
          { hours.map((hour, i) =>
            <ProgramBlockHeader key={i}><h4>{moment(hour, "HH").format("ha")}</h4></ProgramBlockHeader>
          )}
        </Row>
        { props.channels.map((channel) => channel.fields.programs.map((program, i) =>
          <Row key={i}>
            <Link to={channel.fields.slug} className={channelTitleLink}>
              <ProgramTitle>
                <h3>{program.fields.title}</h3>
                { channel.fields.user &&
                  <p className={channelTitleName}>{channel.fields.user.fields.name}</p>
                }
              </ProgramTitle>
            </Link>
            { hours.map((hour, i) =>
              <React.Fragment key={i}>
                {program.fields.programBlocks.find(programBlock => programBlock.fields.startTime === hour) &&
                  <React.Fragment>
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
                  </React.Fragment>
                }
                {!program.fields.programBlocks.find(programBlock => programBlock.fields.startTime === hour) &&
                  <EmptyProgramBlock title="No programming for this hour">
                    <CloseIcon />
                  </EmptyProgramBlock>
                }
              </React.Fragment>
            )}
          </Row>
        ))}
      </TVGuideChart>
    </TVGuideWrapper>
  );
}

const TVGuideWrapper = styled('div')`
  padding: 1rem 1rem 0;
`;

const closeButton = css`
  padding: 1rem 1rem 0;
  cursor: pointer;
`;

const TVGuideChart = styled('div')`
  width: calc(100vw - 2rem);
  overflow-x: scroll;
  -webkit-overflow-scrolling: touch;
`;

const Row = styled('div')`
  width: 100%;
  padding: 1.2rem 0;
  display: flex;
  position: relative;
  align-items: center;

  &:after {
    position: absolute;
    border-bottom: 1px solid #4E475D;
    content: "";
    bottom: 0;
    width: ${(200*25)+(10*25)-16}px; // Hour blocks + title block widths & margins - 1rem page padding
  }
`;

const channelTitleLink = css`
  text-decoration: none;
`;

const channelTitleName = css`
  margin: 0;
`;

const ProgramTitle = styled('div')`
  width: 200px;
  margin: 5px;
  flex-shrink: 0;
`;

const ProgramBlockHeader = styled('div')`
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
