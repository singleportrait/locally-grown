import React, { Component } from 'react';
import { connect } from 'react-redux';
import MediaQuery from 'react-responsive';
import { Link } from 'react-router-dom';

import styled from '@emotion/styled';
import { css } from 'emotion';

import { padding, Header } from './styles';
import WhatIsThisTooltip from './WhatIsThisTooltip';
import TVGuideLink from './TVGuideLink';

import { getRelativeSortedProgramBlocks } from './programBlockHelpers';

import * as moment from 'moment';

class Channels extends Component {
  componentDidMount() {
    // document.title = "All Channels | Locally Grown";
  }

  renderChannel(channel, program, isMobile = false) {
    const currentHour = this.props.session.currentHour;
    const nextHour = currentHour + 1;
    let nextProgramBlock = null;

    const currentProgramBlock = program.fields.programBlocks.find(programBlock => programBlock.fields.startTime === currentHour);
    // TODO: If there isn't anything playing, show the next thing that is
    // const sortedProgramBlocks = getRelativeSortedProgramBlocks(this.props.programBlocks, this.props.currentHour);
    // const nextProgramBlock = sortedProgramBlocks.shift();
    const programClasses = isMobile ? mobileProgramImageContainerStyle : undefined;
    const imageClasses = isMobile || !currentProgramBlock ? textOverImageStyle : undefined;

    if (!currentProgramBlock) {
      const sortedProgramBlocks = getRelativeSortedProgramBlocks(program.fields.programBlocks, currentHour);

      nextProgramBlock = sortedProgramBlocks.shift();
    }

    return (
      <Link to={channel.fields.slug} className={channelContainer}>
        <ProgramContainer className={isMobile ? mobileProgramContainer : ''}>
          <ProgramImageContainer className={programClasses}>
            <ProgramImage className={imageClasses} backgroundImage={program.fields.previewImage && program.fields.previewImage.fields.file.url} />
            { !currentProgramBlock && !isMobile &&
              <NoCurrentProgramBlockText>
                Nothing playing on this channel right now!
              </NoCurrentProgramBlockText>
            }
          </ProgramImageContainer>
          <ProgramInfo className={isMobile ? mobileProgramInfo : ''}>
            { currentProgramBlock &&
              <React.Fragment>
                <h2>{currentProgramBlock.fields.title}</h2>
                <h3 className={isMobile ? undefined : timeWindowStyle}>{moment(currentHour, "HH").format("h")}&ndash;{moment(nextHour, "HH").format("ha")}</h3>
              </React.Fragment>
            }
            { !currentProgramBlock && nextProgramBlock &&
              <React.Fragment>
                <h2>Next up: {nextProgramBlock.fields.title}</h2>
                <h3 className={isMobile ? undefined : timeWindowStyle}>{moment(nextProgramBlock.fields.startTime, "HH").format("h")}&ndash;{moment(nextProgramBlock.fields.startTime + 1, "HH").format("ha")}</h3>
              </React.Fragment>
            }
            <h4>
              {channel.fields.title}
              {channel.fields.user &&
                <div>by {channel.fields.user.fields.name}</div>
              }
            </h4>
            { !currentProgramBlock && isMobile &&
              <p>Nothing playing on this channel right now!</p>
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
        <MediaQuery minWidth={600}>
          <div>
            { this.props.featuredChannels.map((channel) => channel.fields.programs.map((program, i) =>
              <React.Fragment key={i}>{this.renderChannel(channel, program)}</React.Fragment>
            ))}
          </div>
        </MediaQuery>
        <MediaQuery maxWidth={600}>
          <div>
            { this.props.featuredChannels.map((channel) => channel.fields.programs.map((program, i) =>
              <React.Fragment key={i}>{this.renderChannel(channel, program, true)}</React.Fragment>
            ))}
          </div>
        </MediaQuery>
      </ChannelsWrapper>
    );
  }
}

const ChannelsWrapper = styled('div')`
  margin: 1rem;
`;

// TODO: How can I target these rows better? Using modulo or a better formula?
// This only works up to 18 channels
const channelContainer = css`
  display: flex;
  margin: ${padding} 0;
  text-decoration: none;
  position: relative;
  &:nth-child(2), &:nth-child(10) {
    padding-left: calc(15vw - 2.8rem);
  }
  &:nth-child(3), &:nth-child(11) {
    padding-left: calc(30vw - 2.8rem);
  }
  &:nth-child(4), &:nth-child(5), &:nth-child(6), &:nth-child(7),
  &:nth-child(12), &:nth-child(13), &:nth-child(14), &:nth-child(15) {
    &, > div { flex-direction: row-reverse; }
    text-align: right;
  }
  &:nth-child(4), &:nth-child(12) {
    padding-right: 15vw;
  }
  &:nth-child(5), &:nth-child(13) {
  }
  &:nth-child(6), &:nth-child(14) {
    padding-right: 15vw;
  }
  &:nth-child(7), &:nth-child(15) {
    padding-right: 30vw;
  }
  &:nth-child(8), &:nth-child(16) {
    padding-left: 15vw;
  }
`;

const ProgramContainer = styled('div')`
  display: flex;
`;

const mobileProgramContainer = css`
  position: relative;
  display: block;
  text-align: left;
`;

const ProgramImageContainer = styled('div')`
  width: 40vw;
  height: 30vw;
  position: relative;
`;

const mobileProgramImageContainerStyle = css`
  width: 60vw;
  height: 45vw;
`;

const ProgramImage = styled('div')`
  width: 100%;
  height: 100%;
  background-image: url(${props => props.backgroundImage || './static_placeholder4.png'});
  // background-image: url('samurai.png');
  background-size: cover;
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
  margin: 1rem 0;
`;

const ProgramInfo = styled('div')`
  padding: 0 ${padding};
  max-width: 30vw;
`;

const mobileProgramInfo = css`
  position: absolute;
  padding: 0 1rem;
  top: .75rem;
  left: 0;
  max-width: none;
`;

const mapStateToProps = state => ({
  session: state.session
});

export default connect(mapStateToProps)(Channels);
