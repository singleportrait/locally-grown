import styled, { css } from 'react-emotion';

export const padding = '1.25rem';

export const backgroundColor = '#221935';
export const videoBackgroundColor = '#000';

export const borderColor = '#4E475D';

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
  min-height: 50px;
`;

export const Tooltip = styled('div')`
  position: absolute;
  z-index: 1;
  background-color: #fff;
  color: #000;
  padding: 1rem;
  width: 400px;
  margin-top: 2rem;

  @media (max-width: 600px) {
    width: calc(100vw - 2rem);
  }
`;

export const tooltipHeader = css`
  display: flex;
  justify-content: space-between;
`;

export const tooltipCloseButton = css`
  cursor: pointer;
`;

export const programBlockBase = css`
  position: relative;
  width: 200px;
  height: 50px;
  margin: 5px;
  padding: 5px .5rem;
  flex-shrink: 0;
  cursor: default;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

