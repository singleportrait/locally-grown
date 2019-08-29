import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { css } from 'emotion';

import TVGuideLink from './TVGuideLink';

import { Logo } from './styles';

const navigation = css`
  display: flex;
  justify-content: space-between;
`;

class Navigation extends Component {
  render() {
    return (
      <div className={navigation}>
        <div>
          <Link to="/channels" className={css`text-decoration: none;`}><Logo>Locally Grown</Logo></Link>
          Beta!
        </div>
        <TVGuideLink />
      </div>
    );
  }
}

export default Navigation;
