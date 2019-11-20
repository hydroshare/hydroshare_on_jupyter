import { ProjectDetailsPageActions, ProjectsActions } from './actions/action-names';
import {
  AllActionTypes,
  IFileOrFolder,
  IMainPageState,
  IProjectDetailsPageState,
  IProjectsPageState,
  IProjectsState,
  IUserState,
  MainPageActionTypes,
  ProjectsActionTypes,
  UserActionTypes,
  ResourceSource,
} from './types';

const initProjectsPageState: IProjectsPageState = {
  allSelected: false,
  searchTerm: '',
};

const initProjectDetailsPageState: IProjectDetailsPageState = {
  allJupyterSelected: false,
  allHydroShareSelected: false,
  selectedLocalFilesAndFolders: new Set(),
  selectedHydroShareFilesAndFolders: new Set(),
  searchTerm: '',
};

const initMainPageState: IMainPageState = {
  openProjectId: null,
};

const initProjectsState: IProjectsState = {
  searchTerm: '',
  allProjects: {
    'test': {
      files: [
        {
          dirPath: '/',
          name: 'My glorious notebook',
          size: 73949942858,
          type: 'ipynb',
        },
        {
          contents: [
            {
              dirPath: '/contents/',
              name: 'Wonderful data',
              size: 30124234233,
              type: 'csv',
            },
            {
              dirPath: '/contents',
              name: 'More wonderful data',
              size: 552434233,
              type: 'csv',
            },
            {
              dirPath: '/contents',
              name: 'Garbage data',
              size: 10029939402,
              type: 'csv',
            },
            {
              contents: [
                {
                  dirPath: '/contents/Old Data',
                  name: 'Stubby',
                  size: 29934423,
                  type: 'csv',
                },
              ],
              dirPath: '/contents/',
              name: 'Old data',
              size: 399393,
              type: 'folder',
            },
            {
              contents: [
                {
                  dirPath: '/contents/Final data',
                  name: 'Shucks',
                  size: 234230492,
                  type: 'csv',
                },
              ],
              dirPath: '/contents/',
              name: 'Final data',
              size: 40000,
              type: 'folder',
            },
          ],
          dirPath: '/',
          name: 'Data',
          size: 392393,
          type: 'folder',
        },
      ],
      hydroShareResource: {
        author: 'Kyle Combes',
        id: 'Test',
        lastModified: 'May 5',
        status: 'Published',
        source: [ResourceSource.Hydroshare, ResourceSource.JupyterHub],
        files: [
          {
            dirPath: '/',
            name: 'My glorious notebook',
            size: 73949942858,
            type: 'ipynb',
          },
          {
            contents: [
              {
                dirPath: '/contents/',
                name: 'Wonderful data',
                size: 30124234233,
                type: 'csv',
              },
              {
                dirPath: '/contents',
                name: 'More wonderful data',
                size: 552434233,
                type: 'csv',
              },
              {
                dirPath: '/contents',
                name: 'Garbage data',
                size: 10029939402,
                type: 'csv',
              },
            ],
            dirPath: '/',
            name: 'Data',
            size: 392393,
            type: 'folder',
          },
        ],
      },
      id: 'test',
      name: 'Testing'
    },
    vickyTest: {
      files: [],
      hydroShareResource: {
        author: 'Vicky McDermott',
        files: [
          {
            dirPath: '/',
            name: 'Vicky\'s glorious notebook',
            size: 73949942858,
            type: 'ipynb',
          },
        ],
        id: 'vickyTest',
        lastModified: 'Sep 13',
        status: 'Modified',
        source: [ResourceSource.JupyterHub]
      },
      id: 'vickyTest',
      name: 'Some cool data'
    }
  }
};

const initUserState: IUserState = {
  name: 'Kyle Combes',
};

export function mainPageReducer(state: IMainPageState = initMainPageState, action: MainPageActionTypes): IMainPageState {
  switch (action.type) {
    default:
      return state;
  }
}

export function projectsDetailsPageReducer(state: IProjectDetailsPageState = initProjectDetailsPageState, action: AllActionTypes): IProjectDetailsPageState {
  let doMakeSelected;
  switch (action.type) {
    case ProjectDetailsPageActions.TOGGLE_IS_SELECTED_ALL_JUPYTER:
      doMakeSelected = !state.allJupyterSelected;
      return {
        ...state,
        allJupyterSelected: doMakeSelected,
        selectedLocalFilesAndFolders: toggleAllFilesOrFoldersSelected(action.payload.files, doMakeSelected),
      };
    case ProjectDetailsPageActions.TOGGLE_IS_SELECTED_ALL_HYDROSHARE:
      doMakeSelected = !state.allHydroShareSelected;
      const {
        hydroShareResource,
      } = action.payload;
      if (!hydroShareResource) { // Should never be the case
        return state;
      }
      return {
        ...state,
        allHydroShareSelected: doMakeSelected,
        selectedHydroShareFilesAndFolders: toggleAllFilesOrFoldersSelected(hydroShareResource.files, doMakeSelected),
      };
    case ProjectDetailsPageActions.TOGGLE_IS_SELECTED_ONE_JUPYTER:
      return {
        ...state,
        allJupyterSelected: false,
        selectedLocalFilesAndFolders: toggleFileOrFolderSelected(action.payload, state.selectedLocalFilesAndFolders),
      };
    case ProjectDetailsPageActions.TOGGLE_IS_SELECTED_ONE_HYDROSHARE:
      return {
        ...state,
        allHydroShareSelected: false,
        selectedHydroShareFilesAndFolders: toggleFileOrFolderSelected(action.payload, state.selectedHydroShareFilesAndFolders),
      };
    case ProjectDetailsPageActions.SEARCH_PROJECT_BY:
        return {...state, searchTerm: action.payload};
    case ProjectDetailsPageActions.SORT_BY_NAME:
      return {...state, sortBy: action.payload};
    default:
      return state;
  }
}

function toggleAllFilesOrFoldersSelected(files: IFileOrFolder[], doMakeSelected: boolean): Set<string> {
  if (!doMakeSelected) {
    return new Set();
  }
  let selectedFilesAndFolders: Set<string> = new Set();
  files.forEach((projectFileOrFolder: IFileOrFolder) => {
    selectedFilesAndFolders = recursivelySetSelectedState(selectedFilesAndFolders, projectFileOrFolder, doMakeSelected);
  });
  return selectedFilesAndFolders;
}

function toggleFileOrFolderSelected(toggledItem: IFileOrFolder, selectedFilesAndFolders: Set<string>): Set<string> {
  selectedFilesAndFolders = new Set(selectedFilesAndFolders);
  const itemWasSelected = selectedFilesAndFolders.has(toggledItem.dirPath + toggledItem.name);
  return recursivelySetSelectedState(selectedFilesAndFolders, toggledItem, !itemWasSelected);
}

export function projectsPageReducer(state: IProjectsPageState = initProjectsPageState, action: AllActionTypes): IProjectsPageState {
  switch (action.type) {
    case ProjectDetailsPageActions.TOGGLE_IS_SELECTED_ALL_JUPYTER:
      return {...state, allSelected: !state.allSelected};
    case ProjectDetailsPageActions.SEARCH_BY:
      return {...state, searchTerm: action.payload};
    case ProjectDetailsPageActions.SORT_BY_NAME:
      return {...state, sortBy: action.payload};
    case ProjectsActions.NEW_PROJECT:
        return state;
    default:
      return state;
  }
}


export function projectsReducer(state: IProjectsState = initProjectsState, action: ProjectsActionTypes): IProjectsState {
  switch (action.type) {
    case ProjectsActions.SET_PROJECTS:
      return state;
    default:
      return state;
  }
}

export function userReducer(state: IUserState = initUserState, action: UserActionTypes): IUserState {
  switch (action.type) {
    // TODO: Something useful
    default:
      return state;
  }
}

function recursivelySetSelectedState(selections: Set<string>, item: IFileOrFolder, makeSelected: boolean): Set<string> {
  const itemPath = item.dirPath + item.name;
  if (makeSelected) {
    selections.add(itemPath);
  } else {
    selections.delete(itemPath);
  }
  // Check if this is a folder with child files and/or folders
  if (item.contents) {
    item.contents.forEach(childItem => {
      selections = recursivelySetSelectedState(selections, childItem, makeSelected);
    });
  }
  return selections;
}
