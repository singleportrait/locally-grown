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

console.log("Fetching events...");
client.getEntries({
  content_type: "event",
  include: 1,
})
.then(response => {
  console.log("Events fetched.");
  // console.log(response.items);
  const events = response.items.map(event => {
    return {
      title: event.fields.title,
      slug: event.fields.slug,
      description: event.fields.description,
      // Optional chaining `?.` isn't supported yet by eslint
      previewImage: event.fields.previewImage && event.fields.previewImage.fields.file.url || null
    }
  });
  return fs.writeFileSync('data/fetchedEvents.json', JSON.stringify(events));
})
.catch(console.error)
