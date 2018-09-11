import React, { Component } from 'react';
import Video from './Video';

class Program extends Component {
  /* Things to do here:
   * - Find the program block for the current hour
   * - If the hour is random, pick a video at random and start the video
   *   at a random time within it
   * - If the hour is not random, calculate which video should play and
   *   what timestamp it should start at
   */

  constructor(props) {
    super(props);

    this.state = {
      currentHour: new Date().getHours()
    }
  }

  componentDidMount() {
    this.setCurrentProgramBlock();
  }

  setCurrentProgramBlock() {
    const matchingBlock = this.props.program.fields.programBlocks.find(programBlock => {
      // console.log("Found program hour vs. current hour:", programBlock.fields.startTime, this.state.currentHour);
      return programBlock.fields.startTime === this.state.currentHour;
    });

    if (matchingBlock) {
      console.log('Matching program');
      console.log('Videos:', matchingBlock.fields.videos);

      this.setState({
        programBlock: matchingBlock
      });
    } else {
      console.log('No matching program');
    }


  }

  render() {
    const { title, programBlocks } = this.props.program.fields;

    console.log("Program props:", this.props);

    return (
      <div>
        The chosen program:
        <h4>You're watching {title}</h4>
        <p>Now playing:</p>
        { !this.state.programBlock &&
          <div>
            <em>Nothing playing!</em>
          </div>
        }
        { this.state.programBlock &&
          <div>
            <h1>{this.state.programBlock.fields.title}</h1>
            <Video
              programBlockId={this.state.programBlock.sys.id}
              random={this.state.programBlock.fields.isRandom}
            />
          </div>
        }
        <h3>It's {this.state.currentHour} o'clock.</h3>

        { programBlocks.map(({fields}, i) =>
          <div key={i}>
            {fields.startTime}:00 - {fields.title}
          </div>
        )}


      </div>
    );
  }
}

export default Program;
