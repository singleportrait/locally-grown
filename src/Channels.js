import React, { Component } from 'react';
import { connect } from 'react-redux';
import MediaQuery from 'react-responsive';
import { Link } from 'react-router-dom';

import styled, { css } from 'react-emotion';

import { padding, Header } from './styles';
import WhatIsThisTooltip from './WhatIsThisTooltip';
import TVGuideLink from './TVGuideLink';

import * as moment from 'moment';

class Channels extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showTooltip: false
    }

    this.toggleTooltip = this.toggleTooltip.bind(this);
  }

  componentDidMount() {
    document.title = "All Channels | Locally Grown";
  }

  toggleTooltip() {
    this.setState({ showTooltip: !this.state.showTooltip });
  }

  renderChannel(channel, program, isMobile = false) {
    const currentHour = this.props.session.currentHour;
    const nextHour = currentHour + 1;

    const currentProgramBlock = program.fields.programBlocks.find(programBlock => programBlock.fields.startTime === currentHour);
    // TODO: If there isn't anything playing, show the next thing that is
    // const sortedProgramBlocks = getRelativeSortedProgramBlocks(this.props.programBlocks, this.props.currentHour);
    // const nextProgramBlock = sortedProgramBlocks.shift();

    return (
      <Link to={channel.fields.slug} className={channelContainer}>
        <ProgramContainer className={isMobile ? mobileProgramContainer : ''}>
          <ProgramImage className={isMobile ? mobileProgramImage : ''} backgroundImage={program.fields.previewImage && program.fields.previewImage.fields.file.url} />
          <ProgramInfo className={isMobile ? mobileProgramInfo : ''}>
            { currentProgramBlock &&
              <React.Fragment>
                <h2>{currentProgramBlock.fields.title}</h2>
                <h3>{moment(currentHour, "HH").format("h")}&ndash;{moment(nextHour, "HH").format("ha")}</h3>
              </React.Fragment>
            }
            <h4>
              {channel.fields.title}
              {channel.fields.user &&
                <div>by {channel.fields.user.fields.name}</div>
              }
            </h4>
            { !currentProgramBlock &&
              <div>Nothing playing at this hour.</div>
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
          <WhatIsThisTooltip
            toggleInfo={this.toggleTooltip}
            showInfo={this.state.showTooltip}
            showLink={false}
          />
          <h2>Channels</h2>
          <div style={{textAlign: "right"}}>
            It&apos;s {moment(Date.now()).format("h:mma")}.
            <br />
            <TVGuideLink />
          </div>
        </Header>
        <hr />
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

const ProgramImage = styled('div')`
  width: 40vw;
  height: 30vw;
  background-image: url(${props => props.backgroundImage || './static_placeholder4.png'});
  background-size: cover;
`;

const mobileProgramImage = css`
  width: 60vw;
  height: 45vw;
  opacity: .3;
`;

const ProgramInfo = styled('div')`
  padding: 0 ${padding};
  max-width: 30vw;
`;

const mobileProgramInfo = css`
  position: absolute;
  top: ${padding};
  left: 0;
  max-width: none;
`;

const mapStateToProps = state => ({
  session: state.session
});

export default connect(mapStateToProps)(Channels);
