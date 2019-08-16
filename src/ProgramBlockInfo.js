import React, { Component } from 'react';
import PropTypes from 'prop-types';

import * as moment from 'moment';

import styled from '@emotion/styled';
import { css } from 'emotion';

import ProgramBlockInfoDescription from './ProgramBlockInfoDescription';

import { getRelativeSortedProgramBlocks } from './programBlockHelpers';

const ProgramBlockInfoContainer = styled('div')`
  padding-top: 4rem;
`;

const NextProgramBlock = styled('div')`
  padding-bottom: 2rem;
`;

const ProgramBlock = styled('div')`
  display: flex;
  margin-bottom: .5rem;
`;

const programBlocksTime = css`
  opacity: .6;
  min-width: 4rem;
`;

class ProgramBlockInfo extends Component {
  render() {
    const sortedProgramBlocks = getRelativeSortedProgramBlocks(this.props.programBlocks, this.props.currentHour);

    const nextProgramBlock = sortedProgramBlocks.shift();

    return (
      <ProgramBlockInfoContainer>
        { nextProgramBlock &&
          <NextProgramBlock>
            <h4>
              Next up at {moment(nextProgramBlock.fields.startTime, "HH").format("ha")}:
              <br />
              {nextProgramBlock.fields.title}
            </h4>
          </NextProgramBlock>
        }
        { sortedProgramBlocks.map((programBlock, i) =>
          <ProgramBlock key={i}>
            <div className={programBlocksTime}>{moment(programBlock.fields.startTime, "HH").format("ha")}</div>
            <ProgramBlockInfoDescription
              programBlock={programBlock}
              channelSlug={this.props.channelSlug}
              channelTitle={this.props.channelTitle}
            />
          </ProgramBlock>
        )}

        { !nextProgramBlock && !sortedProgramBlocks.length &&
          <p>This program doesn't have any other programming scheduled.</p>
        }
      </ProgramBlockInfoContainer>
    );
  }
}

ProgramBlockInfo.propTypes = {
  programBlocks: PropTypes.array.isRequired,
  // currentHour: PropTypes.number.isRequired
}

export default ProgramBlockInfo;
