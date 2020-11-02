import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import styled from '@emotion/styled/macro';

const modalRoot = document.getElementById('modal');

class Modal extends Component {
  constructor(props) {
    super(props);
    this.el = document.createElement('div');
  }

  componentDidMount() {
    modalRoot.appendChild(this.el);
  }

  componentWillUnmount() {
    modalRoot.removeChild(this.el);
  }

  render() {
    return ReactDOM.createPortal(
      <ModalContainer>
        <ModalOverlay onClick={this.props.closeModal} />
        <Content>
          { this.props.children }
        </Content>
      </ModalContainer>,
      this.el
    );
  }
}

const ModalContainer = styled('div')`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalOverlay = styled('div')`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  background-color: rgba(0,0,0,.5);
`;

const Content = styled('div')`
  width: 400px;
  height: 400px;
  background-color: #fff;
  z-index: 2;
  &, a {
    color: #000;
  }
`;

export default Modal;
