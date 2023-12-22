import React, { Component } from 'react';
import { connect } from 'react-redux';
import MediaQuery from 'react-responsive';
import { Link } from 'react-router-dom';
import * as moment from 'moment';

import styled from '@emotion/styled';
import { css } from '@emotion/css';

import { getRelativeSortedProgramBlocks } from './helpers/programBlockHelpers';

import WhatIsThisTooltip from './components/WhatIsThisTooltip';
import TVGuideLink from './components/TVGuideLink';

import { padding, Header } from './styles';

class Channels extends Component {
  componentDidMount() {
    // document.title = "All Channels | Locally Grown";
  }

  renderChannel(channel, program) {
    const currentHour = this.props.session.currentHour;
    const nextHour = currentHour + 1;
    let nextProgramBlock = null;

    const currentProgramBlock = program.fields.programBlocks.find(programBlock => programBlock.fields.startTime === currentHour);
    // TODO: If there isn't anything playing, show the next thing that is
    // const sortedProgramBlocks = getRelativeSortedProgramBlocks(this.props.programBlocks, this.props.currentHour);
    // const nextProgramBlock = sortedProgramBlocks.shift();

    if (!currentProgramBlock) {
      const sortedProgramBlocks = getRelativeSortedProgramBlocks(program.fields.programBlocks, currentHour);

      nextProgramBlock = sortedProgramBlocks.shift();
    }

    return (
      <Link to={channel.fields.slug} className={channelContainer}>
        <ProgramContainer>
          <ProgramImageContainer>
            <ProgramImage className={!currentProgramBlock && textOverImageStyle} backgroundImage={program.fields.previewImage && program.fields.previewImage.fields.file.url} />
            { !currentProgramBlock &&
              <MediaQuery minWidth={600}>
                <NoCurrentProgramBlockText>
                  Nothing playing on this channel right now!
                </NoCurrentProgramBlockText>
              </MediaQuery>
            }
          </ProgramImageContainer>
          <ProgramInfo>
            { currentProgramBlock &&
              <React.Fragment>
                <h2>{currentProgramBlock.fields.title}</h2>
                <h3 className={timeWindowStyle}>{moment(currentHour, "HH").format("h")}&ndash;{moment(nextHour, "HH").format("ha")}</h3>
              </React.Fragment>
            }
            { !currentProgramBlock && nextProgramBlock &&
              <React.Fragment>
                <h2>Next up: {nextProgramBlock.fields.title}</h2>
                <h3 className={timeWindowStyle}>{moment(nextProgramBlock.fields.startTime, "HH").format("h")}&ndash;{moment(nextProgramBlock.fields.startTime + 1, "HH").format("ha")}</h3>
              </React.Fragment>
            }
            <h4>
              {channel.fields.title}
              {channel.fields.contributor &&
                <div>by {channel.fields.contributor.fields.name}</div>
              }
            </h4>
            { !currentProgramBlock &&
              <MediaQuery minWidth={600}>
                <p>Nothing playing on this channel right now!</p>
              </MediaQuery>
            }
          </ProgramInfo>
        </ProgramContainer>
      </Link>
    );
  }

  render() {
    return (
      <ChannelsWrapper>
        <Header>
          <WhatIsThisTooltip showLink={false} />
          <h2>Channels</h2>
          <div style={{textAlign: "right"}}>
            It&apos;s {moment(Date.now()).format("h:mma")}.
            <br />
            <TVGuideLink />
          </div>
        </Header>
        <hr />
        { this.props.featuredChannels.length === 0 &&
          <h2>Uh oh! There aren&apos;t any featured programs with active programming right now. Come back later!</h2>
        }
        <div>
          { this.props.featuredChannels.map((channel) => channel.fields.programs.map((program, i) =>
            <React.Fragment key={i}>{this.renderChannel(channel, program)}</React.Fragment>
          ))}
        </div>
      </ChannelsWrapper>
    );
  }
}

const ChannelsWrapper = styled('div')`
  margin: 1rem;
`;

// Fun :)
const desktopImageWidth = '40vw';
const mobileImageWidth = '70vw';

const desktopPadding = `(((100vw - ${desktopImageWidth}) - 2rem) / 4)`;
const mobilePadding = `(((100vw - ${mobileImageWidth}) - 2rem) / 4)`;

const channelContainer = css`
  display: flex;
  margin: ${padding} 0;
  text-decoration: none;
  position: relative;

  &:nth-of-type(8n),
  &:nth-of-type(8n + 2) {
    padding-left: calc(${desktopPadding});
  }

  &:nth-of-type(8n + 3) {
    padding-left: calc(${desktopPadding} * 2);
  }

  &:nth-of-type(8n + 4),
  &:nth-of-type(8n + 5),
  &:nth-of-type(8n + 6),
  &:nth-of-type(8n + 7) {
    text-align: right;

    &, > div { flex-direction: row-reverse; }
  }

  &:nth-of-type(8n + 4),
  &:nth-of-type(8n + 6) {
    padding-right: calc(${desktopPadding});
  }

  &:nth-of-type(8n + 5) {
    // Nothing
  }

  &:nth-of-type(8n + 7) {
    padding-right: calc(${desktopPadding} * 2);
  }

  @media screen and (max-width: 600px) {
    &:nth-of-type(8n),
    &:nth-of-type(8n + 2) {
      padding-left: calc(${mobilePadding});
    }

    &:nth-of-type(8n + 3) {
      padding-left: calc(${mobilePadding} * 2);
    }

    &:nth-of-type(8n + 4),
    &:nth-of-type(8n + 5),
    &:nth-of-type(8n + 6),
    &:nth-of-type(8n + 7) {
      text-align: right;

      &, > div { flex-direction: row-reverse; }
    }

    &:nth-of-type(8n + 4),
    &:nth-of-type(8n + 6) {
      padding-right: calc(${mobilePadding});
    }

    &:nth-of-type(8n + 5) {
      // Nothing
    }

    &:nth-of-type(8n + 7) {
      padding-right: calc(${mobilePadding} * 2);
    }
  }
`;

const ProgramContainer = styled('div')`
  display: flex;

  @media screen and (max-width: 600px) {
    position: relative;
    // display: block;
    // text-align: left;
  }
`;

const ProgramImageContainer = styled('div')`
  width: ${desktopImageWidth};
  height: 30vw;
  position: relative;

  @media screen and (max-width: 600px) {
    width: ${mobileImageWidth};
    height: 50vw;
  }
`;

const ProgramImage = styled('div')`
  width: 100%;
  height: 100%;
  background-image: url(${props => props.backgroundImage || './static_placeholder4.png'});
  // background-image: url('samurai.png'); // Testing
  background-size: cover;

  @media screen and (max-width: 600px) {
    opacity: .3;
  }
`;

const textOverImageStyle = css`
  opacity: .3;
`;

const NoCurrentProgramBlockText = styled('h4')`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const timeWindowStyle = css`
  @media screen and (min-width: 600px) {
    margin: 1rem 0;
  }
`;

const ProgramInfo = styled('div')`
  padding: 0 ${padding};
  max-width: 30vw;

  @media screen and (max-width: 600px) {
    position: absolute;
    padding: 0 1rem;
    top: .75rem;
    left: 0;
    max-width: none;
  }
`;

const mapStateToProps = state => ({
  session: state.session
});

export default connect(mapStateToProps)(Channels);
