import React, { Component } from 'react';
import PropTypes from 'prop-types';

class CloseIcon extends Component {
  render() {
    return (
      <svg width="27" height="27" xmlns="http://www.w3.org/2000/svg"><path fill={this.props.color} d="M12.533 10.255c.39-.404.756-.795 1.135-1.174 1.833-1.836 3.668-3.67 5.505-5.501.672-.67 1.472-.755 2.183-.245.642.461.825 1.455.375 2.105a3.84 3.84 0 0 1-.443.512c-2.08 2.091-4.165 4.18-6.247 6.27-.083.083-.16.172-.267.286.107.115.202.224.305.327 2.1 2.102 4.199 4.206 6.306 6.3.47.47.719 1.003.544 1.66a1.581 1.581 0 0 1-2.644.75c-.842-.802-1.648-1.641-2.469-2.465l-4.057-4.072c-.075-.075-.155-.146-.253-.239-.12.108-.233.203-.337.307-2.114 2.12-4.24 4.228-6.332 6.368-.753.769-1.67.66-2.305.123-.6-.509-.728-1.51-.2-2.092.721-.797 1.495-1.547 2.254-2.31 1.474-1.479 2.954-2.952 4.431-4.429.06-.06.115-.126.196-.216-.092-.105-.177-.21-.272-.306-2.11-2.122-4.219-4.246-6.336-6.361-.53-.53-.746-1.115-.466-1.841.392-1.015 1.67-1.354 2.473-.61.876.81 1.705 1.673 2.551 2.517 1.35 1.345 2.696 2.694 4.045 4.04.09.089.187.17.325.296"/></svg>
    );
  }
};

CloseIcon.propTypes = {
  color: PropTypes.string,
}

CloseIcon.defaultProps = {
  color: "#fff",
}

export default CloseIcon;