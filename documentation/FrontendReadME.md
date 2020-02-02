# General structure of frontend

We are writing the frontend in `Typescript` which adds typing to javascript.

`Index.tsx` is what gets run when the app starts up. It contains calls to the components that build up the webpage. 

React allows us to make components (kind of like classes) that can be called at any point to insert a pre-built piece of html/css/javascript into the webpage. These components are in the `components` folder.

The `pages` folder contains the code to render both of the pages. These pages call components. `pages/ProjectsPage.tsx` defines the page that displays the list of resources. `pages/ProjectDetailsPage.tsx` defines the page that displays the files in a specific resource.

We are using React-Redux to manage the state of our application. The way this works is explained in [this blog post](https://medium.com/javascript-in-plain-english/the-only-introduction-to-redux-and-react-redux-youll-ever-need-8ce5da9e53c6). A basic understanding on this is important to understand how information is communicated between the backend and the frontend. The `store` folder contains all of the actions and reducers.
