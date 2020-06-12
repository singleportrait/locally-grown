import React from 'react';
import styled from '@emotion/styled';

import { brandColor, lightBackgroundActiveColor } from './styles';

function BLMButton(props) {
  return (
    <Button
      href="https://linktr.ee/blacklivesmatter"
      target="_blank"
      small={props.small}
      inline={props.inline}
    >
      Support BLM
    </Button>
  )
}

const Button = styled('a')`
  background-color: #fff;
  font-weight: 500;
  font-size: ${props => props.small ? '13px' : '15px'};
  text-decoration: none;
  text-align: center;
  transition: background-color 0.2s ease;
  display: inline-block;
  width: 100%;
  margin-top: 1rem;
  padding: .2rem .6rem;
  height: calc(.4rem + 1.4em);
  border-radius: calc((.4rem + 1.4em) / 2);

  ${props => props.inline && `
    width: auto;
    padding-top: .1rem;
    padding-bottom: .1rem;
    height: calc(.2rem + 1.4em);
    border-radius: calc((.2rem + 1.4em) / 2);
    margin-left: 1rem;
    margin-top: 0;
  `}

  // This !important here is only because iOS isn't respecting the override,
  // which is odd, because I can't reproduce it on the simulator or in
  // Safari developer mode when connected to the phone
  &, &:focus, &:active, &:visited {
    color: ${brandColor} !important;
  }

  &:hover {
    background-color: ${lightBackgroundActiveColor};
  }
`;

export default BLMButton;
