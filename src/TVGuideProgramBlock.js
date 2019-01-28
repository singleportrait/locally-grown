import React, { Component } from 'react';
import { connect } from 'react-redux';
import { findDOMNode } from 'react-dom';
import Overlay from 'react-overlays/lib/Overlay';

import styled, { css } from 'react-emotion';

import * as moment from 'moment';

import CloseIcon from './CloseIcon';
import { programBlockBase, Tooltip, tooltipHeader, tooltipCloseButton } from './styles';

class TVGuideProgramBlock extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showTooltip: false,
    }

    this.toggleTooltip = this.toggleTooltip.bind(this);
  }

  toggleTooltip(e) {
    this.setState({ showTooltip: !this.state.showTooltip });
    e.preventDefault();
  }

  render() {

    const renderCalendarLink = () => {
      const title = this.props.programBlock.fields.title;
      const description = this.props.programBlock.fields.description ? `
${this.props.programBlock.fields.description}` : "";
      const URL = process.env.REACT_APP_DOMAIN + this.props.channelSlug;

      const now = new Date();
      const currentHour = this.props.session.currentHour;
      let date = moment(now).format("YYYYMMDD");

      let startTime = this.props.programBlock.fields.startTime;
      let endTime = this.props.programBlock.fields.startTime + 1;
      const friendlyStartTime = moment(startTime, "HH").format("ha");

      if (currentHour >= startTime) {
        date = moment(date).add(1, 'days').format("YYYYMMDD");
      }

      startTime = moment(startTime, "H").format("HH") + "00";
      endTime = moment(endTime, "H").format("HH") + "00";

      const detailsString = `${URL}

${title}${description}

Playing at ${friendlyStartTime} on ${this.props.channelTitle}.`;

      return (
        <a href={`http://www.google.com/calendar/event?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${date}T${startTime}00/${date}T${endTime}00&details=${encodeURIComponent(detailsString)}&output=xml&trp=false&sprop=&sprop=name:`}
          target="_blank" rel="noopener noreferrer nofollow" className={programHoverLink}>
          Remind Me
        </a>
      );
    }

    return (
      <ProgramBlock
        className={this.props.firstHour && firstHour}
        ref={(t) => { this.target = t; }}
      >
        {this.props.programBlock.fields.title}
        <div className={this.props.firstHour ? programHoverFirstHourLinks : programHoverLinks}>
          { this.props.programBlock.fields.description &&
            <React.Fragment>
              <span className={programHoverLink} onClick={this.toggleTooltip} >??</span>
              <Overlay
                show={this.state.showTooltip}
                onHide={this.toggleTooltip}
                placement="bottom"
                rootClose={true}
                target={() => findDOMNode(this.target)}
              >
                <Tooltip className={programBlockTooltip}>
                  <div className={tooltipHeader}>
                    <h4>{this.props.programBlock.fields.title}</h4>
                    <div className={tooltipCloseButton} onClick={this.toggleTooltip}>
                      <CloseIcon color="#000" />
                    </div>
                  </div>
                  <p>
                    {this.props.programBlock.fields.description}
                  </p>
                </Tooltip>
              </Overlay>
            </React.Fragment>
          }
          { !this.props.firstHour && renderCalendarLink() }
        </div>
      </ProgramBlock>
    );
  }
}

const programBlockTooltip = css`
  margin-left: 100px;
  margin-top: 2px;

  @media (max-width: 600px) {
    margin-left: 1rem;
  }
`;

const ProgramBlock = styled('div')`
  ${programBlockBase};
  background-color: #999;
  color: #000;
  font-weight: 500;
  font-size: 15px;

  &:hover div {
    display: block;
  }
`;

const firstHour = css`
  background-color: #fff;

  span, a {
    color: #000;
  }

  &:hover {
    cursor: pointer;
    background-color: #d2d1d6;

    div {
      background-color: #d2d1d6;
      background: linear-gradient(to right, rgba(210,209,214,0) 0%,rgba(210,209,214,1) 10%,rgba(210,209,214,1) 100%);
    }
  }
`;

const programHoverBase = css`
  display: none;
  position: absolute;
  right: 0;
  bottom: 0;
  padding-left: 10px;
`;

const programHoverLinks = css`
  ${programHoverBase};
  background-color: #999;
  background: linear-gradient(to right, rgba(153,153,153,0) 0%,rgba(153,153,153,1) 10%,rgba(153,153,153,1) 100%);

  span, a {
    color: #fff;
  }
`;

const programHoverFirstHourLinks = css`
  ${programHoverBase};
  background-color: #fff;

  span, a {
    color: #000;
  }
`;

const programHoverLink = css`
  text-decoration: underline;
  cursor: pointer;
  display: inline-block;
  padding: 1px 8px 4px;
`;

const mapStateToProps = state => ({
  session: state.session
});


export default connect(mapStateToProps)(TVGuideProgramBlock);
