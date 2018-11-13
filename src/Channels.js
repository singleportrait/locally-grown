import React, { Component } from 'react';
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
    // TODO: Check if each featured program is in available programs.
    // --Find program block for the current hour within (first?) active program--
    // If not, we'll show something different:
    // "Nothing playing right now for this channel."
    return (
      <ChannelsWrapper>
        <Header>
          <Link to="/">&larr; Back to first program</Link>
          <WhatIsThisTooltip toggleInfo={this.toggleInfo} showInfo={this.state.showInfo} />
          <h1>Channels</h1>
          <div>It's {moment(Date.now()).format("h:mma")}.</div>
        </Header>
        <hr />
        { this.props.featuredChannels.map(({fields}, i) =>
          <div key={i}>
            {fields.title}
          </div>
        )}
      </ChannelsWrapper>
    );
  }
}

export default Channels;
