import React, { Component } from 'react';

class PlayIcon extends Component {
  render() {
    return (
      <svg width="84" height="84" xmlns="http://www.w3.org/2000/svg"><g fill="none" fillRule="evenodd"><circle fill={this.props.color} cx="42" cy="42" r="42"/><path d="M56.097 43.72L35.02 56.21A2 2 0 0132 54.49V29.51a2 2 0 013.02-1.72l21.077 12.49a2 2 0 010 3.44z" fill="#FFF"/></g></svg>
    );
  }
};

PlayIcon.defaultProps = {
  color: "#221935",
}

export default PlayIcon;
