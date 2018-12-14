import React, { Component } from 'react';

class CurrentProgramBlockInfo extends Component {
  render() {
    return (
      <React.Fragment>
        <p>Now playing:</p>
        <h1>{this.props.programBlock.fields.title}</h1>
        <p>{this.props.programBlock.fields.description}</p>
        { this.props.programBlock.programmingLength < 3600 &&
            <p>
              <em>Warning! This block of programming runs out at <strong>{Math.round(this.props.programBlock.programmingLength/60)} minutes</strong> after the hour, so you might get some unexpected behavior while viewing this channel.</em>
            </p>
        }
        { this.props.error &&
            <p>{this.props.error}</p>
        }
      </React.Fragment>
    );
  }
}

export default CurrentProgramBlockInfo;
