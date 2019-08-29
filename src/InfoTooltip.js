import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import Overlay from 'react-overlays/lib/Overlay';
import Markdown from 'react-markdown';

import { css } from 'react-emotion';

import Tooltip from './Tooltip';

class InfoTooltip extends Component {
  render() {
    const user = this.props.user;

    const renderDescription = () => {
      return (
        <React.Fragment>
          {this.props.description &&
            <div>
              <Markdown source={this.props.description} />
            </div>
          }
          {!this.props.description &&
            <p><em>This program doesn&apos;t have a description!</em></p>
          }
          {user &&
            <React.Fragment>
              <br />
              <p><strong>{user.fields.name}</strong></p>
              {user.fields.description &&
                <div>
                  <Markdown source={user.fields.description} />
                </div>
              }
            </React.Fragment>
          }
        </React.Fragment>
      );
    };

    return (
      <React.Fragment>
        <span
          className={tooltipTrigger}
          ref={(t) => { this.target = t; }}
          onClick={this.props.toggleInfo}
        >Info</span>
        <Overlay
          show={this.props.show}
          onHide={this.props.toggleInfo}
          placement="bottom"
          rootClose={true}
          target={() => findDOMNode(this.target)}
        >
          <Tooltip
            title={this.props.title}
            descriptionHTML={renderDescription()}
            close={this.props.toggleInfo}
          />
        </Overlay>
      </React.Fragment>
    );
  }
}

const tooltipTrigger = css`
  text-decoration: underline;
  margin-left: .3rem;
  cursor: pointer;
`;

export default InfoTooltip;
