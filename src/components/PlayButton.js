import React, { Component } from 'react';

import PlayIcon from './PlayIcon';

class PlayButton extends Component {
  togglePlaying = () => {
    this.props.togglePlaying(this.props.togglePlaying);
  }

  render() {
    return (
      <div
        className={this.props.className}
        onClick={this.togglePlaying}
      >
        <PlayIcon />
      </div>
    );
  }
};

PlayButton.defaultProps = {
  className: undefined,
}

export default PlayButton;
