import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import App from './App';
import { unregister } from './registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('root'));
unregister();
