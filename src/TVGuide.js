import React, { Component } from 'react';
import { connect } from 'react-redux';

import styled from 'react-emotion';

import * as moment from 'moment';

import { getRelativeSortedProgramBlocks } from './programBlockHelpers';

const TVGuideWrapper = styled('div')`
  position: absolute;
  width: 100vw;
  min-height: 100vh;
  padding: 1rem;
  background-color: #333;
  overflow-x: scroll;
`;

const Row = styled('div')`
  width: 100%;
  padding: 2rem 0;
  display: flex;
  border-bottom: 1px solid #000;
`;

const ProgramTitle = styled('div')`
  width: 200px;
  margin: 5px;
  flex-shrink: 0;
`;

const ProgramBlockHeader = styled('div')`
  width: 400px;
  height: 60px;
  font-weight: 500;
  font-size: 15px;
  margin: .5rem;
  padding: .5rem;
  flex-shrink: 0;
`;

const ProgramBlock = styled('div')`
  width: 400px;
  height: 60px;
  background-color: #fff;
  color: #000;
  font-weight: 500;
  font-size: 15px;
  margin: .5rem;
  padding: .5rem;
  flex-shrink: 0;
`;

class TVGuide extends Component {
  componentDidMount() {
    document.title = "TV Guide | K-SBI";
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
        <h1>TV Guide</h1>
        <button onClick={this.goBack}>Close</button>
        <em>(This should be 'Back' or /, depending on history)</em>
        <hr/>
        { this.props.channels.length === 0 &&
          <h2>Uh oh! There aren't any featured programs with active programming right now. Come back later!</h2>
        }

        <Row>
          <ProgramTitle></ProgramTitle>
          { hours.map((hour, i) =>
            <ProgramBlockHeader key={i}>{moment(hour, "HH").format("ha")}</ProgramBlockHeader>
          )}
        </Row>
        { this.props.channels.map((channel) => channel.fields.programs.map((program, i) =>
          <Row key={i}>
            <ProgramTitle>
              <h3>{program.fields.title}</h3>
              <p>{channel.fields.title}</p>
            </ProgramTitle>
            { hours.map((hour, i) =>
              <ProgramBlock key={i}>
                {moment(hour, "HH").format("ha")}
                {program.fields.programBlocks.map((programBlock, i) =>
                  <span key={i}>
                    {programBlock.fields.startTime === hour &&
                      <div>- {programBlock.fields.title}</div>
                    }
                  </span>
                )}
              </ProgramBlock>
            )}
          </Row>
        ))}
      </TVGuideWrapper>
    );
  }
}

const mapStateToProps = state => ({
  session: state.session
});


export default connect(mapStateToProps)(TVGuide);
