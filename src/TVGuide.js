import React, { Component } from 'react';

import styled from 'react-emotion';

const TVGuideWrapper = styled('div')`
  position: absolute;
  width: 60vw;
  min-height: 60vh;
  top: 20vh;
  left: 20vw;
  background-color: #333;
`;

const Row = styled('div')`
  width: 100%;
  padding: 2rem 0;
`;

class TVGuide extends Component {
  constructor(props) {
    super(props);
  }

  goBack = () => {
    // TODO: What happens if I come directly to the TV Guide?
    // I need to check if the browser history is this domain,
    // and if it's not (or doesn't exist) go back to '/'
    // Can probably use this.props.history.location.pathname
    this.props.history.goBack();
  }

  render() {
    return (
      <TVGuideWrapper>
        <h1>TV Guide</h1>
        <button onClick={this.goBack}>Close</button>
        <em>(This should be 'Back' or /, depending on history)</em>
        <hr/>
        { this.props.channels.map((channel) => channel.fields.programs.map((program, i) =>
          <Row key={i}>
            <h2>{channel.fields.title}: {program.fields.title}</h2>
            { program.fields.programBlocks.map(({fields}, i) =>
              <div key={i}>
                {fields.startTime}:00 - {fields.title}
              </div>
            )}
          </Row>
        ))}
      </TVGuideWrapper>
    );
  }
}

export default TVGuide;
