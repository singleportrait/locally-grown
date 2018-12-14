import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { css } from 'react-emotion';

import EyeIcon from './EyeIcon';

const tvLink = css`
  opacity: .5;
  text-decoration: none;
`;

const eyeIcon = css`
  position: relative;
  top: 2px;
  margin-right: 5px;
`;

class TVGuideLink extends Component {
  constructor(props) {
    super(props)

    this.state = {
      showClosedEye: false
    }

    this.closeEye = this.closeEye.bind(this);
  }

  closeEye(newState) {
    this.setState({showClosedEye: newState});
  }

  render() {
    return (
      <Link
        to="/tv-guide"
        className={tvLink}
        onMouseEnter={() => this.closeEye(true)}
        onMouseLeave={() => this.closeEye(false)}
      >
        <EyeIcon className={eyeIcon} closed={this.state.showClosedEye} />
        TV Guide
      </Link>
    );
  }
}

export default TVGuideLink;
