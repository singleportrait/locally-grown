import React, { Component } from 'react';
import Program from './Program';
import client from './services-contentful';
import './styles/App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      channels: [],
      programs: []
    }
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

    // TODO: Remove programs that *don't* have a program block
    // for the current hour
    const selectedProgram = programs[Math.floor(Math.random()*programs.length)];

    this.setState({
      program: selectedProgram
    });

    console.log('Setting featured program');
    //console.log(this.state.program.fields.title);
  }

  switchProgram() {
    setInterval(() => {
      this.fetchFeaturedPrograms().then(this.setRandomProgram);
    }, 3000)
  }

  render() {
    //console.log('Rendering app now...');
    return (
      <div className="App">

        { !this.state.program &&
          <em>Loading program...</em>
        }
        { this.state.program &&
          <Program program={this.state.program} />
        }
      </div>
    );
  }
}

export default App;
