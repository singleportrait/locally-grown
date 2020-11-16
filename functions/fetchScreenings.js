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

console.log("Fetching screenings...");
client.getEntries({
  content_type: "screening",
  'fields.isLive': true,
  include: 1,
})
.then(response => {
  console.log("Screenings fetched.");
  // console.log(response.items);
  const screenings = response.items.map(screening => {
    return {
      title: screening.fields.title,
      slug: screening.fields.slug,
      description: screening.fields.description,
      shortDescription: screening.fields.shortDescription,
      // Optional chaining `?.` isn't supported yet by eslint
      previewImage: screening.fields.previewImage && screening.fields.previewImage.fields.file.url || null
    }
  });
  return fs.writeFileSync('data/fetchedScreenings.json', JSON.stringify(screenings));
})
.catch(console.error)
