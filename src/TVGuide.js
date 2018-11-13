import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import styled, { css } from 'react-emotion';

import * as moment from 'moment';

import CloseIcon from './CloseIcon';
import WhatIsThisTooltip from './WhatIsThisTooltip';

import { Header } from './styles';

class TVGuide extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showInfo: false
    }

    this.toggleInfo = this.toggleInfo.bind(this);
  }

  componentDidMount() {
    document.title = "TV Guide | Locally Grown";
  }

  toggleInfo() {
    this.setState({ showInfo: !this.state.showInfo });
  }

  goBack = () => {
    // TODO: What happens if I come directly to the TV Guide?
    // I need to check if the browser history is this domain,
    // and if it's not (or doesn't exist) go back to '/'
    // Can probably use this.props.history.location.pathname
    this.props.history.goBack();
  }

  render() {
    let hours = [];
    const currentHour = this.props.session.currentHour;
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
          <WhatIsThisTooltip toggleInfo={this.toggleInfo} showInfo={this.state.showInfo} />
          <h2>TV Guide</h2>
          <div onClick={this.goBack} className={closeButton}>
            <CloseIcon />
          </div>
        </Header>
        <hr/>
        { this.props.channels.length === 0 &&
          <h2>Uh oh! There aren't any featured programs with active programming right now. Come back later!</h2>
        }

        <TVGuideChart>
          <Row>
            <ProgramTitle></ProgramTitle>
            { hours.map((hour, i) =>
              <ProgramBlockHeader key={i}><h4>{moment(hour, "HH").format("ha")}</h4></ProgramBlockHeader>
            )}
          </Row>
          { this.props.channels.map((channel) => channel.fields.programs.map((program, i) =>
            <Row key={i}>
              <Link to={channel.fields.slug} className={channelTitleLink}>
                <ProgramTitle>
                  <h3>{program.fields.title}</h3>
                  <p className={channelTitleName}>{channel.fields.title}</p>
                </ProgramTitle>
              </Link>
              { hours.map((hour, i) =>
                <React.Fragment key={i}>
                  {program.fields.programBlocks.find(programBlock => programBlock.fields.startTime === hour) &&
                    <React.Fragment>
                      {hours[0] === hour &&
                        <Link to={channel.fields.slug} className={programBlockLink}>
                          <ProgramBlock className={firstHour}>
                            {program.fields.programBlocks.find(programBlock => programBlock.fields.startTime === hour).fields.title}
                          </ProgramBlock>
                        </Link>
                      }
                      {hours[0] !== hour &&
                        <ProgramBlock>
                          {program.fields.programBlocks.find(programBlock => programBlock.fields.startTime === hour).fields.title}
                        </ProgramBlock>
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

const programBlockBase = css`
  width: 200px;
  height: 50px;
  margin: 5px;
  padding: 5px .5rem;
  flex-shrink: 0;
  cursor: default;
`;

const ProgramBlockHeader = styled('div')`
  ${programBlockBase};
  font-weight: 500;
  font-size: 15px;
`;

const ProgramBlock = styled('div')`
  ${programBlockBase};
  background-color: rgba(255,255,255,.5);
  color: #000;
  font-weight: 500;
  font-size: 15px;
`;

const programBlockLink = css`
  text-decoration: none;
`;

const firstHour = css`
  background-color: rgba(255,255,255,1);
  transition: background-color .2s ease;
  &:hover {
    cursor: pointer;
    background-color: rgba(255,255,255,.8);
  }
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
