import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import CurrentProgramBlockInfo from './CurrentProgramBlockInfo';
import ProgramBlockInfo from './ProgramBlockInfo';

class ProgramSidebar extends Component {
  render() {
    return (
      <React.Fragment>
        { this.props.currentProgramBlock && this.props.programBlocks &&
          <CurrentProgramBlockInfo
            programBlock={this.props.currentProgramBlock}
            error={this.props.programBlocks.error}
          />
        }
        { !this.props.currentProgramBlock &&
            <div>
              <br />
              <h1>There&apos;s nothing playing on this channel right now.</h1>
              <br /><br />
              { this.props.programBlocks && this.props.programBlocks.error &&
                  <p>{this.props.programBlocks.error}</p>
              }
              <Link to="/tv-guide">Check out the TV Guide</Link> to find something.
            </div>
        }
        { this.props.programBlocks &&
          <ProgramBlockInfo
            programBlocks={this.props.programBlocks}
            currentHour={this.props.currentHour}
            channelTitle={this.props.channelTitle}
            channelSlug={this.props.channelSlug}
          />
        }
      </React.Fragment>
    );
  }
}

export default ProgramSidebar;
