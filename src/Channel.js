import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchFeaturedPrograms, fetchSelectedProgram } from './actions/programActions';

import client from './services-contentful';
import Program from './Program';
import Navigation from './Navigation';

class Channel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      currentHour: new Date().getHours(),
      matchingPrograms: [],
      matchingProgramIndex: null
    }

    this.nextProgram = this.nextProgram.bind(this);
    this.previousProgram = this.previousProgram.bind(this);
  }

  componentDidMount() {
    // programActions.js
    // fetchSelectedProgram()
    // getProgram()
    // FETCH_SELECTED_PROGRAM
    this.fetchFeaturedPrograms().then(this.setRandomProgram, function(reason) {
      console.log('Could not fetch because: ', reason);
    });

    this.props.fetchSelectedProgram();

  }

  /* We need to fetch programs that are:
   * - Featured
   * - Have a ProgramBlock in the current hour
   *    - e.g. if it's 7pm, make sure they have content for that hour
   * - Currently active, meaning:
   *    - Start date is today or earlier
   *    - End date is today or later
   */
  // programActions.js
  // FETCH_FEATURED_PROGRAMS
  fetchFeaturedPrograms = () => client.getEntries({
    content_type: 'program',
    'fields.featured': true
  });

  setRandomProgram = response => {
    const programs = response.items;
    let matchingPrograms = [];

    // Remove programs that *don't* have a program block
    // for the current hour
  // this.props.fetchAvailableFeaturedPrograms();
  // FETCH_AVAILABLE_FEATURED_PROGRAMS
    programs.map(program => program.fields.programBlocks.forEach(programBlock => {
      if (programBlock.fields.startTime === this.state.currentHour) {
        return matchingPrograms.push(program);
      }
    }));

    // TODO: Push `matchingPrograms` up to a state / session that allows us
    // to consistently have next and previous channels
    console.log("Featured Programs with an active Program Block for this hour:", matchingPrograms);

    // TODO: Create randomNumber() helper function
    const randomNumber = Math.floor(Math.random()*matchingPrograms.length);
    const selectedProgram = matchingPrograms[randomNumber];

    this.setState({
      matchingPrograms: matchingPrograms,
      matchingProgramIndex: randomNumber,
      program: selectedProgram,
      loaded: true
    });
  }

  // programActions.js
  // GO_TO_NEXT_PROGRAM
  nextProgram = () => {
    // TODO: Set current time in order to come back to exact future video
    let newIndex = this.state.matchingProgramIndex + 1;

    if (newIndex > this.state.matchingPrograms.length - 1) {
      newIndex = 0;
    }

    this.setState((state) => ({
      matchingProgramIndex: newIndex,
      program: state.matchingPrograms[newIndex]
    }));
  }

  // programActions.js
  // GO_TO_PREVIOUS_PROGRAM
  previousProgram = () => {
    let newIndex = this.state.matchingProgramIndex - 1;

    if (newIndex < 0) {
      newIndex = this.state.matchingPrograms.length - 1;
    }

    this.setState((state) => ({
      matchingProgramIndex: newIndex,
      program: state.matchingPrograms[newIndex]
    }));
  }

  render() {
    return (
      <div>
        <Navigation />
        { !this.state.loaded &&
          <em>Loading program...</em>
        }
        { this.props.programs.error &&
          <h1>Errored out! Sorry</h1>
        }
        { this.state.loaded && !this.props.programs.currentProgram &&
          <em>No active programs!</em>
        }
        { this.state.loaded && this.state.program &&
          <Program program={this.state.program} />
        }
        { this.props.programs.currentProgram &&
          <div>
            <h1>Default Program:</h1>
            <Program program={this.props.programs.currentProgram} currentHour={this.props.programs.currentHour} />
          </div>
        }
        { this.props.programs.availablePrograms.length > 1 &&
          <div>
            <button onClick={this.nextProgram}>Next program</button>
            <button onClick={this.previousProgram}>Previous program</button>
          </div>
        }
      </div>
    );
  }
}

const mapStateToProps = state => ({
  programs: state.programs
});

//export default Channel;
export default connect(mapStateToProps, { fetchFeaturedPrograms, fetchSelectedProgram })(Channel);
