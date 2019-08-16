import React, { Component } from 'react';
import Overlay from 'react-overlays/lib/Overlay';
import Markdown from 'react-markdown';

import * as moment from 'moment';

import { css } from 'react-emotion';

import CloseIcon from './CloseIcon';
import { Tooltip, tooltipHeader, tooltipCloseButton } from './styles';

class InfoAndRemindLinks extends Component {

  render() {

    const {
      fields: {
        title,
        description,
        startTime,
      }
    } = this.props.programBlock;

    const renderCalendarLink = () => {
      const friendlyDescription = description ? `
${description}` : "";
      const URL = process.env.REACT_APP_DOMAIN + this.props.channelSlug;

      const now = new Date();
      let date = moment(now).format("YYYYMMDD");

      const friendlyStartTime = moment(startTime, "HH").format("ha");

      if (this.props.currentHour >= startTime) {
        date = moment(date).add(1, 'days').format("YYYYMMDD");
      }

      const calStartTime = moment(startTime, "H").format("HH") + "00";
      const calEndTime = moment((startTime + 1), "H").format("HH") + "00";

      const detailsString = `${URL}

${title}${friendlyDescription}

Playing at ${friendlyStartTime} on ${this.props.channelTitle}.`;

      return (
        <a href={`http://www.google.com/calendar/event?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${date}T${calStartTime}00/${date}T${calEndTime}00&details=${encodeURIComponent(detailsString)}&output=xml&trp=false&sprop=&sprop=name:`}
          target="_blank" rel="noopener noreferrer nofollow" className={programHoverLink}>
          Remind Me
        </a>
      );
    }

    return (
      <React.Fragment>
        { description &&
          <React.Fragment>
            <span className={programHoverLink} onClick={this.props.toggleTooltip} >??</span>
            <Overlay
              show={this.props.show}
              onHide={this.props.toggleTooltip}
              placement="bottom"
              rootClose={true}
              target={this.props.target}
            >
              <Tooltip className={programBlockTooltip}>
                <div className={tooltipHeader}>
                  <h4>{title}</h4>
                  <div className={tooltipCloseButton} onClick={this.props.toggleTooltip}>
                    <CloseIcon color="#000" />
                  </div>
                </div>
                <div>
                  <Markdown source={description} />
                </div>
              </Tooltip>
            </Overlay>
          </React.Fragment>
        }
        { !this.props.firstHour && renderCalendarLink() }
      </React.Fragment>
    );
  }
}

const programHoverLink = css`
  text-decoration: underline;
  cursor: pointer;
  display: inline-block;
  padding: 1px 8px 4px;
`;

const programBlockTooltip = css`
  margin-left: 100px;
  margin-top: 2px;

  @media (max-width: 600px) {
    margin-left: 1rem;
  }
`;


export default InfoAndRemindLinks;
