import React, { Component } from 'react';
import PropTypes from 'prop-types';

import * as moment from 'moment';

class ProgramBlockInfo extends Component {
  render() {
    return (
      <div className="programBlockInfo">
        { this.props.programBlocks.map(({fields}, i) =>
          <div key={i}>
            {moment(fields.startTime, "HH").format("ha")} - {fields.title}
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
