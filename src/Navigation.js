import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Navigation extends Component {
  render() {
    return (
      <div>
        <Link to="/channels">K-SBI</Link>
        &nbsp;Beta!&nbsp;&nbsp;|&nbsp;&nbsp;
        <Link to="/tv-guide">TV Guide</Link>
      </div>
    )
  }
}

export default Navigation;
