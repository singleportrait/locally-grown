import React, { Component } from 'react';
import Overlay from 'react-bootstrap/Overlay';
import Markdown from 'react-markdown';

import { css } from 'emotion';

import Tooltip from './Tooltip';

class InfoTooltip extends Component {
  constructor(props) {
    super(props);

    this.target = React.createRef();
  }

  render() {
    const description = this.props.description;
    const user = this.props.user;

    const renderDescription = () => {
      return (
        <React.Fragment>
          {description &&
            <div>
              <Markdown source={description} />
            </div>
          }
          {!description &&
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
