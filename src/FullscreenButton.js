import React, { Component } from 'react';
import { connect } from 'react-redux';

import screenfull from 'screenfull';
import { findDOMNode } from 'react-dom'

class FullscreenButton extends Component {
  goFullscreen = () => screenfull.request(findDOMNode(this.props.video.player));

  render() {
    return (
      <React.Fragment>
        { this.props.video.player &&
          <button onClick={this.goFullscreen}>Fullscreen!</button>
        }
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  video: state.video
});

export default connect(mapStateToProps)(FullscreenButton);
