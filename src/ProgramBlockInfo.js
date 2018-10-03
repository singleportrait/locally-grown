import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ProgramBlockInfo extends Component {
  render() {
    return (
      <div className="programBlockInfo">
        { this.props.programBlocks.map(({fields}, i) =>
          <div key={i}>
            {fields.startTime}:00 - {fields.title}
          </div>
        )}
      </div>
    );
  }
}

ProgramBlockInfo.propTypes = {
  programBlocks: PropTypes.array.isRequired
}

export default ProgramBlockInfo;
