import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Navigation from './Navigation';
import PropTypes from 'prop-types';

import Program from './Program';

class Channel extends Component {
  render() {
    const channelFields = this.props.channel.fields;
    return (
      <div>
        <Navigation />
        { channelFields &&
          <div>
            <h1>{channelFields.title}</h1>
            { channelFields.programs.length > 1 &&
              <h3>This channel has multiple available programs grr</h3>
            }

            { channelFields.programs.length === 0 &&
              <div>
                <h2>This channel doesn't have any active programs right now.</h2>
                <Link to="/tv-guide">Check out the TV Guide</Link> to find some.
              </div>
            }

            { channelFields.programs.length > 0 &&
              <Program program={channelFields.programs[0]} />
            }

            { this.props.channel.nextChannelSlug && this.props.channel.previousChannelSlug &&
              <div>
                <Link to={`/${this.props.channel.previousChannelSlug}`}>Previous channel</Link>
                <br />
                <Link to={`/${this.props.channel.nextChannelSlug}`}>Next channel</Link>
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
