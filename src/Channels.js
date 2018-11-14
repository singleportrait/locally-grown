import React, { Component } from 'react';
import { connect } from 'react-redux';
import MediaQuery from 'react-responsive';
import { Link } from 'react-router-dom';

import styled from 'react-emotion';

import { padding, Header } from './styles';
import WhatIsThisTooltip from './WhatIsThisTooltip';

import * as moment from 'moment';

class Channels extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showInfo: false
    }

    this.toggleInfo = this.toggleInfo.bind(this);
  }

  componentDidMount() {
    document.title = "All Channels | Locally Grown";
  }

  toggleInfo() {
    this.setState({ showInfo: !this.state.showInfo });
  }

  render() {

    const multipliedChannels = this.props.featuredChannels.concat(this.props.featuredChannels.concat(this.props.featuredChannels.concat(this.props.featuredChannels)));
    // TODO: Check if each featured program is in available programs.
    // --Find program block for the current hour within (first?) active program--
    // If not, we'll show something different:
    // "Nothing playing right now for this channel."
    return (
      <ChannelsWrapper>
        <Header>
          <Link to="/">&larr; Back to first program</Link>
          <WhatIsThisTooltip
            toggleInfo={this.toggleInfo}
            showInfo={this.state.showInfo}
            showLink={false}
          />
          <h2>Channels</h2>
          <div>It's {moment(Date.now()).format("h:mma")}.</div>
        </Header>
        <hr />
        <Link to="/tv-guide">TV Guide</Link>
        <MediaQuery minWidth={600}>
          <div>
            { multipliedChannels.map(({fields}, i) =>
              <Channel key={i}>
                <ProgramImage src="" />
                <ProgramInfo>
                  <h2>Hourly Programming {i}</h2>
                  <h3>5-6am</h3>
                  <h4>{fields.title} by User</h4>
                  <p>Note: Need to display whether something is playing for this hour</p>
                </ProgramInfo>
              </Channel>
            )}
          </div>
        </MediaQuery>
        <MediaQuery maxWidth={600}>
          <div>
            { multipliedChannels.map(({fields}, i) =>
              <Channel key={i}>
                <MobileProgramContainer>
                  <MobileProgramImage src="" />
                  <MobileProgramInfo>
                    <h2>Hourly Programming {i}</h2>
                    <h3>5-6am</h3>
                    <h4>{fields.title} by User</h4>
                    <p>Note: Need to display whether something is playing for this hour</p>
                  </MobileProgramInfo>
                </MobileProgramContainer>
              </Channel>
            )}
          </div>
        </MediaQuery>
      </ChannelsWrapper>
    );
  }
}

const ChannelsWrapper = styled('div')`
  margin: 1.4rem;
`;

// TODO: How can I target these rows better? Using modulo or a better formula?
const Channel = styled('div')`
  display: flex;
  margin: ${padding} 0;
  &:nth-child(2), &:nth-child(10) {
    padding-left: calc(15vw - 2.8rem);
  }
  &:nth-child(3), &:nth-child(11) {
    padding-left: calc(30vw - 2.8rem);
  }
  &:nth-child(4), &:nth-child(5), &:nth-child(6), &:nth-child(7) {
    flex-direction: row-reverse;
    text-align: right;
  }
  &:nth-child(4) {
    padding-right: 15vw;
  }
  &:nth-child(5) {
  }
  &:nth-child(6) {
    padding-right: 15vw;
  }
  &:nth-child(7) {
    padding-right: 30vw;
  }
  &:nth-child(8) {
    padding-left: 15vw;
  }
`;

const ProgramImage = styled('img')`
  width: 40vw;
  height: 30vw;
`;

const ProgramInfo = styled('div')`
  padding: 0 ${padding};
  max-width: 30vw;
`;

const MobileProgramContainer = styled('div')`
  position: relative;
`;

const MobileProgramImage = styled('img')`
  width: 60vw;
  height: 45vw;
`;

const MobileProgramInfo = styled('div')`
  position: absolute;
  top: ${padding};
  left: ${padding};
`;

const mapStateToProps = state => ({
  session: state.session
});

export default connect(mapStateToProps)(Channels);
