import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import styled, { css } from 'react-emotion';

import * as moment from 'moment';

const TVGuideWrapper = styled('div')`
  position: absolute;
  width: 100vw;
  min-height: 100vh;
  padding: 1rem;
  background-color: #221935;
  overflow-x: scroll;
`;

const Row = styled('div')`
  width: 100%;
  padding: 2rem 0;
  display: flex;
  border-bottom: 1px solid #000;
`;

const ProgramTitle = styled('div')`
  width: 200px;
  margin: 5px;
  flex-shrink: 0;
`;

const programBlockBase = css`
  width: 200px;
  height: 50px;
  margin: .3rem;
  padding: .3rem .5rem;
  flex-shrink: 0;
  cursor: default;
`;

const ProgramBlockHeader = styled('div')`
  ${programBlockBase};
  font-weight: 500;
  font-size: 15px;
`;

const ProgramBlock = styled('div')`
  ${programBlockBase};
  background-color: rgba(255,255,255,.5);
  color: #000;
  font-weight: 500;
  font-size: 15px;
`;

const programBlockLink = css`
  text-decoration: none;
`;

const firstHour = css`
  background-color: rgba(255,255,255,1);
  transition: background-color .2s ease;
  &:hover {
    cursor: pointer;
    background-color: rgba(255,255,255,.8);
  }
`;

const EmptyProgramBlock = styled('div')`
  ${programBlockBase};
  text-align: center;
  opacity: .5;
`;

class TVGuide extends Component {
  componentDidMount() {
    document.title = "TV Guide | Locally Grown";
  }

  goBack = () => {
    // TODO: What happens if I come directly to the TV Guide?
    // I need to check if the browser history is this domain,
    // and if it's not (or doesn't exist) go back to '/'
    // Can probably use this.props.history.location.pathname
    this.props.history.goBack();
  }

  render() {
    let hours = [];
    const currentHour = this.props.session.currentHour;
    for (let i = currentHour; i < 24; i++) {
      hours.push(i);
    }
    if (currentHour !== 0) {
      for (let i = 0; i < currentHour; i++) {
        hours.push(i);
      }
    }

    // TODO: Figure out a better way to know if NONE of
    // the program blocks match

    return (
      <TVGuideWrapper>
        <h1>TV Guide</h1>
        <button onClick={this.goBack}>Close</button>
        <em>(This should be 'Back' or /, depending on history)</em>
        <hr/>
        { this.props.channels.length === 0 &&
          <h2>Uh oh! There aren't any featured programs with active programming right now. Come back later!</h2>
        }

        <Row>
          <ProgramTitle></ProgramTitle>
          { hours.map((hour, i) =>
            <ProgramBlockHeader key={i}><h4>{moment(hour, "HH").format("ha")}</h4></ProgramBlockHeader>
          )}
        </Row>
        { this.props.channels.map((channel) => channel.fields.programs.map((program, i) =>
          <Row key={i}>
            <ProgramTitle>
              <h3><Link to={channel.fields.slug}>{program.fields.title}</Link></h3>
              <p>{channel.fields.title}</p>
            </ProgramTitle>
            { hours.map((hour, i) =>
              <React.Fragment key={i}>
                {program.fields.programBlocks.find(programBlock => programBlock.fields.startTime === hour) &&
                  <React.Fragment>
                    {hours[0] === hour &&
                      <Link to={channel.fields.slug} className={programBlockLink}>
                        <ProgramBlock className={firstHour}>
                          {program.fields.programBlocks.find(programBlock => programBlock.fields.startTime === hour).fields.title}
                        </ProgramBlock>
                      </Link>
                    }
                    {hours[0] !== hour &&
                      <ProgramBlock>
                        {program.fields.programBlocks.find(programBlock => programBlock.fields.startTime === hour).fields.title}
                      </ProgramBlock>
                    }
                  </React.Fragment>
                }
                {!program.fields.programBlocks.find(programBlock => programBlock.fields.startTime === hour) &&
                  <EmptyProgramBlock>
                    X
                  </EmptyProgramBlock>
                }
              </React.Fragment>
            )}
          </Row>
        ))}
      </TVGuideWrapper>
    );
  }
}

const mapStateToProps = state => ({
  session: state.session
});


export default connect(mapStateToProps)(TVGuide);
