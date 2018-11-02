import React, { Component } from 'react';
import PropTypes from 'prop-types';

import * as moment from 'moment';

import { getRelativeSortedProgramBlocks } from './programBlockHelpers';

class ProgramBlockInfo extends Component {
  render() {
    const sortedProgramBlocks = getRelativeSortedProgramBlocks(this.props.programBlocks, this.props.currentHour);

    const nextProgramBlock = sortedProgramBlocks.shift();

    return (
      <div className="programBlockInfo">
        { nextProgramBlock &&
          <div>
            Next up at {moment(nextProgramBlock.fields.startTime, "HH").format("ha")}:
            <br />
            {nextProgramBlock.fields.title}
            <br />
            <br />
          </div>
        }
        { sortedProgramBlocks.map(({fields}, i) =>
          <div key={i}>
            {moment(fields.startTime, "HH").format("ha")} - {fields.title}
          </div>
        )}
      </div>
    );
  }
}

ProgramBlockInfo.propTypes = {
  programBlocks: PropTypes.array.isRequired,
  // currentHour: PropTypes.number.isRequired
}

export default ProgramBlockInfo;
