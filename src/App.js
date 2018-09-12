import React, { Component } from 'react';
import Program from './Program';
import client from './services-contentful';
import './styles/App.css';

class App extends Component {
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
    this.fetchFeaturedPrograms().then(this.setRandomProgram);
  }

  /* We need to fetch programs that are:
   * - Featured
   * - Have a ProgramBlock in the current hour
   *    - e.g. if it's 7pm, make sure they have content for that hour
   * - Currently active, meaning:
   *    - Start date is today or earlier
   *    - End date is today or later
   */
  fetchFeaturedPrograms = () => client.getEntries({
    content_type: 'program',
    'fields.featured': true
  });

  setRandomProgram = response => {
    const programs = response.items;
    let matchingPrograms = [];

    // Remove programs that *don't* have a program block
    // for the current hour
    programs.map(program => {
      return program.fields.programBlocks.map(programBlock => {
        if (programBlock.fields.startTime === this.state.currentHour) {
          return matchingPrograms.push(program);
        }
      });
    });

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

  nextProgram = () => {
    let newIndex = this.state.matchingProgramIndex + 1;

    if (newIndex > this.state.matchingPrograms.length - 1) {
      newIndex = 0;
    }

    this.setState((state) => ({
      matchingProgramIndex: newIndex,
      program: state.matchingPrograms[newIndex]
    }));
  }

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
      <div className="App">

        { !this.state.loaded &&
          <em>Loading program...</em>
        }
        { this.state.loaded && !this.state.program &&
          <em>No active programs!</em>
        }
        { this.state.loaded && this.state.program &&
          <Program program={this.state.program} />
        }
        <button onClick={this.nextProgram}>Next program</button>
        <button onClick={this.previousProgram}>Previous program</button>
      </div>
    );
  }
}

export default App;
