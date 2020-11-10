import styled from '@emotion/styled';

export const padding = '1.25rem';

export const brandColor = '#221935';

export const alternatingBackgroundColor = '#271F39';
export const videoBackgroundColor = '#000';

export const inputBackgroundColor = '#312647';
export const inputActiveBackgroundColor = '#3a2e54';

export const lightBackgroundActiveColor = '#E3D9F6';

export const borderColor = '#4E475D';

// export const successColor = '#7AC772';
export const successColor = '#5CCB66';
export const errorColor = '#FF6E6D';

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
  padding-top: ${props => props.isMobile ? '50%' : '75%'};
  background: url(./static_placeholder_simpler.gif);
  background-size: cover;
`;

export const Button = styled('button')`
  background-color: ${props => props.color ? props.color : "#fff"};
  color: ${props => props.textColor ? props.textColor: "#000"};
  font-weight: 500;
  font-size: ${props => props.small ? '13px' : props.large ? '22px' : '15px'};
  text-decoration: none;
  text-align: center;
  transition: background-color 0.2s ease;
  display: inline-block;
  width: 100%;
  width: auto;
  margin-top: ${props => !props.noMargin && "1rem"};
  padding: 0 .9em;
  line-height: 2.2;
  border-radius: 2em;
  // padding: .2rem .6rem;
  // padding: .2em .6em .3em;
  // height: calc(.4em + 1.4em);
  // border-radius: calc((.4em + 1.4em) / 2);
  -webkit-appearance: none;
  outline: none;
  cursor: ${props => props.disabled ? 'default' : 'pointer' };

  &:focus {
    background-color: ${props => props.backgroundColor ? props.backgroundColor : "#eee"};
  }
`;

export const ButtonDiv = Button.withComponent('div');
