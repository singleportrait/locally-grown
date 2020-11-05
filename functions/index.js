const functions = require('firebase-functions');
const express = require('express');
const path = require('path');
const fs = require('fs');
const removeMarkdown = require('remove-markdown');

const app = express();

const channels = JSON.parse(fs.readFileSync(path.resolve(__dirname, './data', 'fetchedChannels.json')));
const screenings = JSON.parse(fs.readFileSync(path.resolve(__dirname, './data', 'fetchedScreenings.json')));

const appName = "Locally Grown TV";
const appDescription = "Locally Grown is something you can leave on because you trust us. Grassroots TV-esque format meant to be exactly what it needs to be.";

const setMetadata = (route, title, description) => {
  app.get(route, (request, response) => {
    // functions.logger.info(`${title} visited!`, {structuredData: true});
    let data = fs.readFileSync(path.resolve(__dirname, './web', 'index.html')).toString();

    data = data.replace(/(https:\/\/locallygrown\.tv)(\/)/g, '$1'+route);
    data = data.replace(/__TITLE__/g, title || appName);
    data = data.replace(/__DESCRIPTION__/g, description || appDescription);

    response.send(data);
  });
}

setMetadata("/tv-guide", "TV Guide | Locally Grown TV", "Just like TV—view our TV Guide to see what's coming up on all our featured channels.");

setMetadata("/channels", "Channels | Locally Grown TV", "See what's playing now on all our currently-featured channels.");

// This was showing as a 404 in Firebase logs, originally
setMetadata("/index.html", appName, appDescription);

const setDynamicMetadata = (response, slug, title, description) => {
  // functions.logger.info(`${title} visited!`);

  let data = fs.readFileSync('./web/index.html').toString();

  // Slightly different treatment than setMetadata() above
  data = data.replace(/(https:\/\/locallygrown\.tv\/)/g, '$&'+slug);
  data = data.replace(/__TITLE__/g, `${title} | Locally Grown TV` || appName);
  data = data.replace(/__DESCRIPTION__/g, removeMarkdown(description) || appDescription);

  return response.send(data);
}

// Dynamic (channel) routes
app.get("/:slug", (request, response) => {
  const slug = request.params.slug;
  const channel = channels.find(channel => channel.slug === slug);

  if (!channel) {
    functions.logger.info(`Didn't find slug '${slug}', redirecting to home`);
    return response.redirect(404, "/");
  }

  setDynamicMetadata(response, slug, channel.title, channel.description);

});

// Dynamic (screening) routes
app.get("/screenings/:slug", (request, response) => {
  const slug = request.params.slug;
  const screening = screenings.find(screening => screening.slug === slug);

  if (!screening) {
    functions.logger.info(`Didn't find screening '${slug}', redirecting to home`);
    return response.redirect(404, '/');
  }

  setDynamicMetadata(response, slug, screening.title, screening.description);
});

// This line doesn't seem to be necessary
// app.use(express.static(path.resolve(__dirname, './web')));

setMetadata("/", appName, appDescription);

// Fallback that 404s for all other unknown pages
app.get('*', (request, response) => {
  response.status(404).send("Sorry, we couldn't find that!");
});

// For debugging routes, if needed
// console.log(app._router.stack);

exports.app = functions.https.onRequest(app);

/* Export Stripe routes from functions/stripe.js
 * These will look like `stripe-createStripeCustomer` when deployed */
exports.stripe = require('./stripe');

/* TODO: Remove users from users/{userId} and screenings/{screeningId}/members/{userId}
 * when auth users are deleted. Stripe's FB Functions has an example */
// exports.cleanupUser = functions.auth.user().onDelete(async (user) => {
// });
