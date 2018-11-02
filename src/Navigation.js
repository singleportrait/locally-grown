import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { css } from 'react-emotion';

const navigation = css`
  display: flex;
  justify-content: space-between;
`;

class Navigation extends Component {
  render() {
    return (
      <div className={navigation}>
        <span>
          <Link to="/channels">K-SBI</Link>
          &nbsp;Beta!
        </span>
        <Link to="/tv-guide">TV Guide</Link>
      </div>
    );
  }
}

export default Navigation;
