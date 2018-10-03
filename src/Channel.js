import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import Program from './Program';

class Channel extends Component {
  render() {
    const channelFields = this.props.channel.fields;
    return (
      <div className="channel">
        { channelFields &&
          <div>
            { channelFields.programs.length > 1 &&
              <h3>This channel has multiple available programs grr</h3>
            }

            { channelFields.programs.length > 0 &&
              <Program
                program={channelFields.programs[0]}
                channelTitle={channelFields.title}
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
