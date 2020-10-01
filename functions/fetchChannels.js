const dotenv = require('dotenv');
const functions = require('firebase-functions');
const { createClient } = require('contentful');
const fs = require('fs');

dotenv.config();

// Mimicking src/services-contentful, for ease of not requiring import
const client = createClient({
  space: 'erbmau6qmrq2',
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN
})

console.log("Fetching channels...");
client.getEntries({
  content_type: "channel",
  include: 1,
})
.then(response => {
  console.log("Channels fetched.");
  // console.log(response.items);
  const channels = response.items.map(channel => {
    return {
      title: channel.fields.title,
      slug: channel.fields.slug,
      description: channel.fields.description,
      // Optional chaining `?.` isn't supported yet by eslint
      previewImage: channel.fields.previewImage && channel.fields.previewImage.fields.file.url || null
    }
  });
  return fs.writeFileSync('data/fetchedChannels.json', JSON.stringify(channels));
})
.catch(console.error)
