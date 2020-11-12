import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import styled from '@emotion/styled/macro';

import CloseIcon from './CloseIcon';

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
          { this.props.closeModal &&
            <CloseModal onClick={this.props.closeModal}>
              <CloseIcon color="#000" />
            </CloseModal>
          }
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
  background-color: rgba(0,0,0,.9);
`;

const Content = styled('div')`
  width: 400px;
  min-height: 300px;
  padding: 1rem;
  position: relative;
  background-color: #fff;
  z-index: 2;

  @media screen and (max-width: 600px) {
    width: 90vw;
    min-height: 40vh;
  }

  &, a {
    color: #000;
  }
`;

const CloseModal = styled('div')`
  position: absolute;
  top: 0;
  right: 0;
  padding: 1rem;
  cursor: pointer;
`;

export default Modal;
