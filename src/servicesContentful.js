import { createClient } from 'contentful';

const client = createClient({
  space: 'erbmau6qmrq2',
  accessToken: process.env.REACT_APP_CONTENTFUL_ACCESS_TOKEN
})

export default client;
