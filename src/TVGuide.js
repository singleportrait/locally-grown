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
`;

const ProgramBlock = styled('div')`
  width: 200px;
  background-color: #fff;
  color: #000;
  font-weight: 500;
  font-size: 15px;
  margin: .5rem;
  padding: .5rem;
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
    // TODO: Create 24 hour period dynamically
    // hours.push(this.props.session.currentHour)
    // hours[hours.length - 1] + 1
    // if (<last hour + 1> < 23 && <last hour> !== this.props.session.currentHour) {
    //   hours.push(<last hour + 1>);
    // } else if (<last hour + 1> > 23) {
    //   hours.push(0);
    //   16...24 + 0...15
    // }
    const hours = [16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4];

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
            <ProgramBlock key={i}>{moment(hour, "HH").format("ha")}</ProgramBlock>
          )}
        </Row>
        { this.props.channels.map((channel) => channel.fields.programs.map((program, i) =>
          <Row key={i}>
            <ProgramTitle>
              <h3>{channel.fields.title}: {program.fields.title}</h3>
            </ProgramTitle>
            { getRelativeSortedProgramBlocks(program.fields.programBlocks, this.props.session.currentHour).map(({fields}, i) =>
              <ProgramBlock key={i}>
                {moment(fields.startTime, "HH").format("ha")} - {fields.title}
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
