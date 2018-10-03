import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import MediaQuery from 'react-responsive';

import { getCurrentProgramBlock } from './operations/programBlockOperations';

import Video from './Video';
import Navigation from './Navigation';
import ProgramBlockInfo from './ProgramBlockInfo';

import { css } from 'react-emotion';

class Program extends Component {
  componentDidMount() {
    this.initializeProgram();
  }

  initializeProgram() {
    // TODO: Check whether program blocks exist at a higher level?
    // If you go to a direct URL of a channel and it has programs, but they don't have any
    // program blocks inside them, this page errors
    if (this.props.program.fields.programBlocks) {
      const currentProgramBlock = this.props.program.fields.programBlocks.find(programBlock => {
        return programBlock.fields.startTime === this.props.session.currentHour;
      })

      if (currentProgramBlock) {
        this.props.getCurrentProgramBlock(currentProgramBlock.sys.id);
      } else {
        console.log("No current program block!");
      }
    } else {
      console.log("No program blocks!");
    }
  }

  render() {
    const program = this.props.program;
    const { programBlocks } = program.fields;
    const currentProgramBlock = this.props.programBlocks.currentProgramBlock;

    return (
      <div className={programClass}>
        <MediaQuery minDeviceWidth={600}>
          <div className={videoAndControlsColumn}>
            { currentProgramBlock &&
              <React.Fragment>
                <Video
                  video={currentProgramBlock.currentVideo}
                  timestamp={currentProgramBlock.timestampToStartVideo}
                />

                { this.props.nextChannelSlug && this.props.previousChannelSlug &&
                  <div>
                    <Link to={`/${this.props.previousChannelSlug}`}>Previous channel</Link>
                    &nbsp;
                    <Link to={`/${this.props.nextChannelSlug}`}>Next channel</Link>
                  </div>
                }
              </React.Fragment>
            }

            { !currentProgramBlock &&
              <h1>Loading video...</h1>
            }
          </div>
          <div className={infoColumn}>
            <Navigation />
            <p>You're watching {this.props.channelTitle} by &lt;name&gt;</p>
            <a href="">Info</a>
            <p>It's {this.props.session.currentHour} o'clock</p>
            <hr/>
            { currentProgramBlock &&
              <React.Fragment>
                <p>Now playing:</p>
                <h1>{currentProgramBlock.fields.title}</h1>
                <p>Description: {currentProgramBlock.fields.description}</p>
              </React.Fragment>
            }
            { !currentProgramBlock &&
              <div>
                <em>This program doesn't have any program blocks!</em>
                <br /><br />
                <Link to="/tv-guide">Check out the TV Guide</Link> to find some.
              </div>
            }
            { programBlocks &&
              <ProgramBlockInfo programBlocks={programBlocks} />
            }
          </div>
        </MediaQuery>
        <MediaQuery maxDeviceWidth={600}>
          You're on a phone! Too bad, this isn't for you yet.
        </MediaQuery>
      </div>
    );
  }
}

const programClass = css`
  display: flex;
  margin: 1.4rem;
  position: relative;
`;

const videoAndControlsColumn = css`
  position: relative;
  width: 65%;
  transition: width 0.4s ease;
  transform: translateZ(0);
  backface-visibility: hidden;
`;

const infoColumn = css`
  position: absolute;
  right: 0;
  width: 35%;
  padding-left: 1.4rem;
  opacity: 1;
  transition: opacity 0.4s ease, right 0.4s ease;
  transform: translateZ(0);
  backface-visibility: hidden;
`;

const mapStateToProps = state => ({
  programBlocks: state.programBlocks,
  session: state.session
});

export default connect(mapStateToProps, { getCurrentProgramBlock })(Program);
