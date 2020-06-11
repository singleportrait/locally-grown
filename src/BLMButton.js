import React from 'react';
import styled from '@emotion/styled';

import { brandColor, lightBackgroundActiveColor } from './styles';

function BLMButton(props) {
  return (
    <Button
      href="https://linktr.ee/blacklivesmatter"
      target="_blank"
      small={props.small}
    >
      Support BLM
    </Button>
  )
}

const Button = styled('a')`
  background-color: #fff;
  font-weight: 500;
  font-size: 15px;
  text-decoration: none;
  padding: .2rem .6rem;
  height: calc(.4rem + 1.4em);
  border-radius: calc((.4rem + 1.4em) / 2);
  display: inline-block;
  width: 100%;
  text-align: center;
  margin-top: 1rem;
  transition: background-color 0.2s ease;

  &, &:visited {
    color: ${brandColor};
  }

  &:hover {
    background-color: ${lightBackgroundActiveColor};
  }
`;

export default BLMButton;
