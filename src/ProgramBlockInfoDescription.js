import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import Overlay from 'react-overlays/lib/Overlay';
import Markdown from 'react-markdown';

import { css } from 'react-emotion';

import Tooltip from './Tooltip';
import RemindLink from './RemindLink';

class ProgramBlockInfoDescription extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showDescription: false,
    }

    this.toggleDescription = this.toggleDescription.bind(this);
  }

  toggleDescription(e) {
    console.log("Toggling description");
    this.setState({ showDescription: !this.state.showDescription });
    e.preventDefault();
  }

  render() {

    const {
      fields: {
        title,
        description,
      }
    } = this.props.programBlock;

    const renderDescription = () => {
      return (
        <div>
          { description &&
            <React.Fragment>
              <Markdown source={description} />
              <br />
            </React.Fragment>
          }
          <RemindLink
            programBlock={this.props.programBlock}
            channelTitle={this.props.channelTitle}
            channelSlug={this.props.channelSlug}
          />
        </div>
      );
    }

    return(
      <React.Fragment>
        <div className={programBlockDescriptionLink} ref={(t) => { this.target = t; }} onClick={this.toggleDescription}>
          {title}
        </div>
        <Overlay
          show={this.state.showDescription}
          onHide={this.toggleDescription}
          placement="bottom"
          rootClose={true}
          target={() => findDOMNode(this.target)}
        >
          <Tooltip
            title={"Info"}
            showTitle={false}
            tooltipClassName={descriptionTooltipStyle}
            descriptionHTML={renderDescription()}
          />
        </Overlay>
      </React.Fragment>
    );
  }
}

const programBlockDescriptionLink = css`
  cursor: pointer;
  opacity: .6;
  transition: opacity .1s ease;

  &:hover {
    opacity: .8;
  }
`;

const descriptionTooltipStyle = css`
  width: auto;
  max-width: 250px;
`;

export default ProgramBlockInfoDescription;
