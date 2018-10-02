import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Navigation from './Navigation';

import ProgramReduxed from './ProgramReduxed';

class ChannelWithSlug extends Component {
  render() {
    const channelFields = this.props.channel.fields;
    return (
      <div>
        <Navigation />
        { channelFields &&
          <div>
            <h1>Channel here: {channelFields.title}</h1>
            { channelFields.programs.length > 1 &&
              <h2>This channel has multiple programs grr</h2>
            }

            { channelFields.programs.length &&
              <ProgramReduxed program={channelFields.programs[0]} />
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

        { !this.props.channel &&
          <h1>No channel!</h1>
        }
      </div>
    );
  }
}

export default ChannelWithSlug;
