# CUAHSI Jupyter Sync Frontend

The frontend is a [React](https://reactjs.org/) app written in [TypeScript](https://typescriptlang.org/).
It uses [Redux](https://redux.js.org/) for state management and gets all of its data from the backend via HTTP requests.

The file `webapp/dist/bundle.js` is a compiled version of the webapp, allowing it to be run without setting up a
development environment. This file is typically served by the backend.

# Development

Running this code requires [Node.js](https://nodejs.org/en/) v8.0 or above. (We recommend using
[n](https://github.com/tj/n) to install and manage Node versions.) You'll also need a package manager
(we recommend [Yarn](https://classic.yarnpkg.com/en/docs/install/#debian-stable)).

Once you have Node and Yarn installed, install the web app dependencies:

```bash
$ cd webapp
$ yarn install
```

Then run the following to start the app up in development mode (with source maps and hot reloading):

```bash
$ yarn start
```

Then open [http://localhost:3000](http://localhost:3000) to view it in the browser.

# Deployment

If you would like to update the bundled app served by the backend when running in development mode, run

```bash
$ yarn build
```

To create a new release (i.e. bundled app served by the Jupyter server extension), run

```bash
$ yarn deploy
```

This will create a new `webapp/dist/bundle.js`.

# Architecture

The file `src/index.tsx` is the entry point into the app. This file then displays the correct components depending on
the URL (using [React Router](https://reacttraining.com/react-router/) bound to Redux using
 [connected-react-router](https://github.com/supasate/connected-react-router)).
 
 ## Pages

The [React components](https://reactjs.org/docs/components-and-props.html) defined in `src/pages` are the various
"pages" of the app. There are currently only two:

* `MainPage.tsx` displays the list of resources
* `ResourcePage.tsx` displays the resource metadata, file manager, and readme

## Non-Page Components

The rest of the components are defined in `src/components`. They get their information passed via props from Redux
(discussed below).

## App State and Communication with the Backend

Most of the application state is stored in a [Redux](https://redux.js.org/) store. This makes it so we can make
information (e.g. resource data) available across our app.
[This blog post](https://medium.com/javascript-in-plain-english/the-only-introduction-to-redux-and-react-redux-youll-ever-need-8ce5da9e53c6)
provides a nice introduction to using Redux with React. A basic understanding on this is important to understand how
data is stored in the frontend.

The `src/store` directory contains all of the Redux-related files. (This includes all of the code making requests to the
backend.)
