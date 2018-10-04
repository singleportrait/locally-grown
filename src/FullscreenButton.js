import React, { Component } from 'react';
import { connect } from 'react-redux';

import screenfull from 'screenfull';
import { findDOMNode } from 'react-dom'

class FullscreenButton extends Component {
  goFullscreen = () => {
    if (screenfull.enabled) {
      screenfull.request(findDOMNode(this.props.video.player));
    } else {
      console.log("This isn't supported");
    }

    // The official React way (doesn't work immediately)
    // screenfull.request(this.player.current);
  }

  render() {
    return (
      <React.Fragment>
        { this.props.video.player && screenfull.enabled &&
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
