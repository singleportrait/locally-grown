import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import consoleLog from './helpers/consoleLog';

import Program from './Program';

class Channel extends Component {
  render() {
    const channelFields = this.props.channel.fields;

    const channelTitle = `${channelFields.title} | ${process.env.REACT_APP_NAME}`;
    const channelURL = process.env.REACT_APP_DOMAIN + channelFields.slug;
    const shareImageURL = (channelFields.programs[0].fields.previewImage ? channelFields.programs[0].fields.previewImage.fields.file.url : process.env.REACT_APP_DOMAIN + "share.png");

    if (channelFields.programs.length > 1) {
      consoleLog("- Warning: This channel has multiple available programs for this date. Channel: ", channelFields.title, channelFields.programs);
    }
    return (
      <div className="channel">
        <Helmet>
          <title>{channelTitle}</title>
          <link rel="canonical" href={channelURL} />
          <meta property="og:title" content={channelTitle} />
          <meta property="og:description" content={channelFields.description} />
          <meta property="og:image" content={shareImageURL} />
        </Helmet>
        { channelFields &&
          <div>
            { channelFields.programs.length > 0 &&
              <Program
                program={channelFields.programs[0]}
                channelTitle={channelFields.title}
                channelContributor={channelFields.contributor}
                channelSlug={channelFields.slug}
                previousChannelSlug={this.props.channel.previousChannelSlug}
                nextChannelSlug={this.props.channel.nextChannelSlug}
              />
            }

            { channelFields.programs.length === 0 &&
              <div>
                <h2>This channel doesn't have any active programs right now.</h2>
                <Link to="/tv-guide">Check out the TV Guide</Link> to find some.
              </div>
            }
          </div>
        }
      </div>
    );
  }
}

Channel.propTypes = {
  channel: PropTypes.object
}

export default Channel;
