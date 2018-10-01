import React, { Component } from 'react';
import { connect } from 'react-redux';
import { initializePrograms, goToNextProgram, goToPreviousProgram } from './operations/programOperations';

// import client from './services-contentful';
import ProgramReduxed from './ProgramReduxed';
import Navigation from './Navigation';

class Channel extends Component {
  constructor(props) {
    super(props);

    this.nextProgram = this.nextProgram.bind(this);
    this.previousProgram = this.previousProgram.bind(this);
  }

  componentDidMount() {
    this.props.initializePrograms();
  }

  nextProgram = () => {
    this.props.goToNextProgram();
  }

  previousProgram = () => {
    this.props.goToPreviousProgram();
  }

  render() {
    return (
      <div>
        <Navigation />
        { !this.props.programs.isLoaded &&
          <em>Loading program...</em>
        }
        { this.props.programs.isLoaded &&
          <div>
            { !this.props.programs.currentProgram &&
              <em>No active programs!</em>
            }
            { this.props.programs.error &&
              <em>{this.props.programs.error}</em>
            }
            { this.props.programs.currentProgram &&
              <div>
                <h1>Playing a program:</h1>
                <ProgramReduxed program={this.props.programs.currentProgram} currentHour={this.props.session.currentHour} />
              </div>
            }
            { this.props.programs.availablePrograms.length > 1 &&
              <div>
                <button onClick={this.nextProgram}>Next program</button>
                <button onClick={this.previousProgram}>Previous program</button>
              </div>
            }
          </div>
        }
      </div>
    );
  }
}

const mapStateToProps = state => ({
  programs: state.programs,
  session: state.session
});

const mapDispatchToProps = dispatch => ({
  initializePrograms: () => dispatch(initializePrograms()),
  goToNextProgram: () => dispatch(goToNextProgram()),
  goToPreviousProgram: () => dispatch(goToPreviousProgram())
})

export default connect(mapStateToProps, mapDispatchToProps)(Channel);
