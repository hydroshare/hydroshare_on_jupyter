import {
  ProjectDetailsPageActions,
  ProjectsActions,
  UserInfoActions,
} from './actions/action-names';
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
          name: 'Watershed',
          size: 73949942858,
          type: 'ipynb',
        },
        {
          contents: [
            {
              dirPath: '/contents/',
              name: 'CA Water Depth',
              size: 30124234233,
              type: 'csv',
            },
            {
              dirPath: '/contents',
              name: 'WA Water Depth',
              size: 552434233,
              type: 'csv',
            },
            {
              dirPath: '/contents',
              name: 'OH Water Depth',
              size: 10029939402,
              type: 'csv',
            },
            {
              contents: [
                {
                  dirPath: '/contents/Utah',
                  name: 'Water Depth',
                  size: 29934423,
                  type: 'csv',
                },
                {
                  dirPath: '/contents/Utah',
                  name: 'Water Flow',
                  size: 10034423,
                  type: 'csv',
                },
              ],
              dirPath: '/contents/',
              name: 'Utah',
              size: 399393,
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
        id: 'test',
        lastModified: 'May 5',
        status: 'Published',
        source: [ResourceSource.Hydroshare, ResourceSource.JupyterHub],
        files: [
          {
            dirPath: '/',
            name: 'Watershed',
            size: 73949942858,
            type: 'ipynb',
          },
          {
            contents: [
              {
                dirPath: '/contents/',
                name: 'CA Water Depth',
                size: 30124234233,
                type: 'csv',
              },
              {
                dirPath: '/contents',
                name: 'WA Water Depth',
                size: 552434233,
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
      name: 'Watershed Model'
    },
    vickyTest: {
      files: [],
      hydroShareResource: {
        author: 'Vicky McDermott',
        files: [
          {
            dirPath: '/',
            name: 'playingAround',
            size: 73949942858,
            type: 'ipynb',
          },
        ],
        id: 'vickyTest',
        lastModified: 'Sep 13',
        status: 'Modified',
        source: [ResourceSource.Hydroshare]
      },
      id: 'vickyTest',
      name: 'Flow'
    }
  }
};

const initUserState: IUserState = {
  name: '',
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
    case UserInfoActions.SET_USER_INFO:
      return {...state, ...action.payload};
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
