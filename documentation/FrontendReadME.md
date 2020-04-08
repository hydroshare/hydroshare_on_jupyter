[//]: # (SPIFFY (Vicky) Can this file have a more descriptive name?)

# General structure of frontend

We are writing the frontend in `Typescript` which adds typing to javascript.

`Index.tsx` is what gets run when the app starts up. It contains calls to the components that build up the webpage.

React allows us to make components (kind of like classes) that can be called at any point to insert a pre-built piece of html/css/javascript into the webpage. These components are in the `components` folder.

The `pages` folder contains the code to render both of the pages. These pages call components. `pages/MainPage.tsx` defines the page that displays the list of resources. `pages/ResourcePage.tsx` defines the page that displays the files in a specific resource.

We are using React-Redux to manage the state of our application. The way this works is explained in [this blog post](https://medium.com/javascript-in-plain-english/the-only-introduction-to-redux-and-react-redux-youll-ever-need-8ce5da9e53c6). A basic understanding on this is important to understand how information is communicated between the backend and the frontend. The `store` folder contains all of the actions and reducers.

A Typescript component has a state and props. [This blog post](https://codeburst.io/react-state-vs-props-explained-51beebd73b21) explains the difference between the two.


## Components

Below is a quick description of each file and the components they define:

 - `FileManager.tsx` allows the user to drag and drop files between JupyterHub and HydroShare
 - `Header.tsx` header bar for page. Contains the image of CUAHSI logo as well as "welcome, x user"
 - `NewResourceModal.tsx` modal that pops up to create a new project

 [//]: # (SPIFFY (Vicky) Not sure if this codereview todo from last time has been resolved?)

 [//]: # (TODO (Emily)): can we get things like replacing openfilemodal in as tasks in asana? I didn't know this was a thing)
 - `OpenFileModal.tsx` placeholder modal for opening files. Made this for AGU, will be changed so don't bother reviewing this.
 - `ProjectInfo.tsx` displays information about resource (author, last modified, abstract)
 - `ResourceList.tsx` displays list of resources
