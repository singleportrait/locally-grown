This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

Below you will find some information on how to perform common tasks.<br>
You can find the most recent version of this guide [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).

## LOCALLY GROWN TV WEBSITE

Some notable things it's built with:

- Contentful as the headless API
- Redux as the data store
- Firebase for deploying/hosting
- `react-router` for routes
- `react-emotion` for inline styles
- `react-responsive` for mobile code

The full instructions for running this app are in [this Dropbox Paper doc](https://paper.dropbox.com/doc/Locally-Grown-Tech-Notes--A~DjNLQ_WSzG9YzVQe0TciFvAg-wGGxqlI9LsCNOAPHGKbVR);

### Running Firestore Rules tests

The security rules unit tests for Firestore are in the `/tests` folder.

The rules themselves are in `firestore.rules`, and are deployed to the server with every deploy.

If you update any Firestore fields, you should check the rules file to make sure all permissions are set correctly.

To run the tests, first the Firebase emulators need to be running:

```
firebase emulators:start
```

And then, from within the `/tests` folder, you can run:

```
npm test
```
