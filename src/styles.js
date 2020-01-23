import styled from '@emotion/styled';

export const padding = '1.25rem';

export const backgroundColor = '#221935';
export const videoBackgroundColor = '#000';

export const borderColor = '#4E475D';

export const mobileViewportHeight = window.innerHeight + 'px';

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

export const programBlockBase = `
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

export const VideoPlaceholderWrapper = styled('div')`
  position: relative;
  padding-top: 75%;
  background: url(./static_placeholder_simpler.gif);
  background-size: cover;
`;
