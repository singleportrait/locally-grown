import React, { Component } from 'react';
import { connect } from 'react-redux';

import * as moment from 'moment';

class RemindLink extends Component {
  render() {

    const {
      fields: {
        title,
        description,
        startTime,
      }
    } = this.props.programBlock;

    const friendlyDescription = description ? `
${description}` : "";
    const URL = process.env.REACT_APP_DOMAIN + this.props.channelSlug;

    const now = new Date();
    let date = moment(now).format("YYYYMMDD");

    const friendlyStartTime = moment(startTime, "HH").format("ha");

    if (this.props.session.currentHour >= startTime) {
      date = moment(date).add(1, 'days').format("YYYYMMDD");
    }

    const calStartTime = moment(startTime, "H").format("HH") + "00";
    const calEndTime = moment((startTime + 1), "H").format("HH") + "00";

    const detailsString = `${URL}

${title}${friendlyDescription}

Playing at ${friendlyStartTime} on ${this.props.channelTitle}.`;

    return (
      <a href={`
http://www.google.com/calendar/event
?action=TEMPLATE
&text=${encodeURIComponent(title)}
&dates=${date}T${calStartTime}00/${date}T${calEndTime}00
&details=${encodeURIComponent(detailsString)}
&output=xml
&trp=false
&sprop=
&sprop=name:
`}
        target="_blank" rel="noopener noreferrer nofollow" className={this.props.className}>
        Remind Me
      </a>
    );
  }
}

const mapStateToProps = state => ({
  session: state.session
});

export default connect(mapStateToProps)(RemindLink);
