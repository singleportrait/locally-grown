This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

Below you will find some information on how to perform common tasks.<br>
You can find the most recent version of this guide [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).

## LOCALLY GROWN TV WEBSITE

### Installing

The packages were last updated to the latest-and-greatest in November 2023.

You can install everything using:

```
npm install
```

And run the app with:

```
npm start
```

In order to get the app working you need 3 environment files:

```
# .env
REACT_APP_DOMAIN=https://locallygrown.tv/
REACT_APP_NAME="Locally Grown TV"
REACT_APP_DESCRIPTION="Locally Grown is something you can leave on because you trust us. Grassroots TV-esque format meant to be exactly what it needs to be."
```

```
# .env.development
REACT_APP_DOMAIN=http://localhost:3000/
```

```
# .env.local
REACT_APP_CONTENTFUL_ACCESS_TOKEN // From Contentful, 'Locally Grown TV Web App': https://app.contentful.com/spaces/erbmau6qmrq2/api/keys
REACT_APP_FIREBASE_API_KEY // From Firebase: https://console.firebase.google.com/u/1/project/locally-grown-tv/settings/general/web:YWI2NTM0YzctNDYxMi00NzBkLWIzNDYtMmU3ZWY2MjZiODlj
REACT_APP_FIREBASE_AUTH_DOMAIN
REACT_APP_FIREBASE_DATABASE_URL
REACT_APP_FIREBASE_PROJECT_ID
REACT_APP_FIREBASE_STORAGE_BUCKET
REACT_APP_FIREBASE_MESSAGING_SENDER_ID
REACT_APP_FIREBASE_APP_ID
REACT_APP_DRM_VIDEO_PASSWORD=bar2020
REACT_APP_STRIPE_PUBLISHABLE_TEST_KEY // From Stripe, with login billing@locallygrown.tv
REACT_APP_STRIPE_PUBLISHABLE_LIVE_KEY
```

There's also some important routing happening via Firebase Functions. Instructions are on Dropbox Paper here: https://paper.dropbox.com/doc/Locally-Grown-Tech-Notes--CEL~W8AYLJBHq4Vh2eDKMqPiAg-wGGxqlI9LsCNOAPHGKbVR

### Deploying

The main app is currently deployed from the branch `firebase-react-ui-auth`. The instructions for deploying are also in Dropbox Paper: https://paper.dropbox.com/doc/Locally-Grown-Tech-Notes--CEL~W8AYLJBHq4Vh2eDKMqPiAg-wGGxqlI9LsCNOAPHGKbVR

** Note: Do not build the app from `main` until merging in that PR: https://github.com/singleportrait/locally-grown/pull/31. It will also need updated packages, most likely.

### Notes

Some notable things it's built with:

- Contentful as the headless API
- Redux as the data store
- Firebase for deploying/hosting
- `react-router` for routes
- `react-emotion` for inline styles
- `react-responsive` for mobile code
