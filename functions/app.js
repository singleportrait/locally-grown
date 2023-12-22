const functions = require('firebase-functions');

const express = require('express');
const path = require('path');
const fs = require('fs');
const removeMarkdown = require('remove-markdown');

const app = express();

const channels = JSON.parse(fs.readFileSync(path.resolve(__dirname, './data', 'fetchedChannels.json')));
const screenings = JSON.parse(fs.readFileSync(path.resolve(__dirname, './data', 'fetchedScreenings.json')));

const appName = "Locally Grown TV";
const appNamePlaceholderRegexp = /Locally Grown TV/g;

/* Note! If we changed this description text to "Locally Grown TV", these regexps will break. Just a word of warning! */
const appDescription = "Locally Grown is something you can leave on because you trust us. Grassroots TV-esque format meant to be exactly what it needs to be.";
const appDescriptionRegexp = /Locally Grown is something you can leave on because you trust us. Grassroots TV-esque format meant to be exactly what it needs to be./g;
const shareImage = "/share.png";

const setMetadata = (route, title, description) => {
  app.get(route, (request, response) => {
    // functions.logger.info(`${title} visited!`, {structuredData: true});
    let data = fs.readFileSync(path.resolve(__dirname, './web', 'index.html')).toString();

    data = data.replace(/(https:\/\/locallygrown\.tv)(\/)/g, '$1'+route);
    data = data.replace(appNamePlaceholderRegexp, title || appName);
    data = data.replace(appDescriptionRegexp, description || appDescription);

    response.send(data);
  });
}

setMetadata("/tv-guide", "TV Guide | Locally Grown TV", "Just like TV—view our TV Guide to see what's coming up on all our featured channels.");

setMetadata("/channels", "Channels | Locally Grown TV", "See what's playing now on all our currently-featured channels.");

// This was showing as a 404 in Firebase logs, originally
setMetadata("/index.html", appName, appDescription);

const setDynamicMetadata = (response, slug, title, description, previewImage) => {
  // functions.logger.info(`${title} visited!`);

  let data = fs.readFileSync('./web/index.html').toString();

  // Slightly different treatment than setMetadata() above
  data = data.replace(/(https:\/\/locallygrown\.tv\/)/g, '$&'+slug);
  data = data.replace(appNamePlaceholderRegexp, `${title} | Locally Grown TV` || appName);
  data = data.replace(appDescriptionRegexp, removeMarkdown(description) || appDescription);
  data = data.replace(/\/share\.png/g, previewImage || shareImage);

  response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
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

  return setDynamicMetadata(response, slug, channel.title, channel.description);
});

// Dynamic (screening) routes
app.get("/screenings/:slug", (request, response) => {
  const slug = request.params.slug;
  const screening = screenings.find(screening => screening.slug === slug);

  if (!screening) {
    functions.logger.info(`Didn't find screening '${slug}', redirecting to home`);
    return response.redirect(404, '/');
  }

  const compressedPreviewImage = screening.previewImage ? `${screening.previewImage}?fm=jpg&fl=progressive&w=1200` : undefined;

  return setDynamicMetadata(
    response,
    `screenings/${slug}`,
    screening.title,
    screening.shortDescription,
    compressedPreviewImage
  );
});

// This line doesn't seem to be necessary
app.use(express.static(path.resolve(__dirname, './web')));

setMetadata("/", appName, appDescription);

// Fallback that 404s for all other unknown pages
app.get('/*', (request, response) => {
  // response.status(404).send("Sorry, we couldn't find that!");
  // Suggestion from Create React App that may have helped:
  response.sendFile(path.join(__dirname, './web', 'index.html'));
});

// For debugging routes, if needed
// console.log(app._router.stack);

exports.app = functions.https.onRequest(app);