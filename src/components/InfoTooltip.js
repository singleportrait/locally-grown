import React, { Component } from 'react';
import Overlay from 'react-bootstrap/Overlay';
import Markdown from 'react-markdown';

import { css } from '@emotion/css';

import Tooltip from './Tooltip';

class InfoTooltip extends Component {
  constructor(props) {
    super(props);

    this.target = React.createRef();
  }

  render() {
    const description = this.props.description;
    const contributor = this.props.contributor;

    const renderDescription = () => {
      return (
        <React.Fragment>
          {description &&
            <div>
              <Markdown>
                {description}
              </Markdown>
            </div>
          }
          {!description &&
            <p><em>This program doesn&apos;t have a description!</em></p>
          }
          {contributor &&
            <React.Fragment>
              <br />
              <p><strong>{contributor.fields.name}</strong></p>
              {contributor.fields.description &&
                <div>
                  <Markdown>
                    {contributor.fields.description}
                  </Markdown>
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
          ref={this.target}
          onClick={this.props.toggleInfo}
        >Info</span>

        <Overlay
          show={this.props.show}
          onHide={this.props.toggleInfo}
          rootClose={true}
          target={this.target.current}
          placement="bottom"
        >
          {({
            ...props
          }) => (
            <Tooltip
              {...props}
              title={this.props.title}
              descriptionHTML={renderDescription()}
            />
          )}
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
