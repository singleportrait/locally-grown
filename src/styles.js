import styled, { css } from 'react-emotion';

export const padding = '1.25rem';

export const Logo = styled('div')`
  font-weight: 900;
  font-size: 13px;
  letter-spacing: .15em;
  text-transform: uppercase;
`;

export const Header = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

export const Tooltip = styled('div')`
  position: absolute;
  z-index: 1;
  background-color: #fff;
  color: #000;
  padding: 1rem;
  width: 400px;
  margin-top: 2rem;
`;

export const tooltipHeader = css`
  display: flex;
  justify-content: space-between;
`;

export const tooltipCloseButton = css`
  cursor: pointer;
`;

