import { ProjectDetailsPageActions } from './actions/action-names';
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
} from './types';

const initProjectsPageState: IProjectsPageState = {
  allSelected: false,
  sortBy: 'Name'
  searchTerm: '',
};

const initProjectDetailsPageState: IProjectDetailsPageState = {
  allSelected: false,
  selectedFilesAndFolders: new Set(),
  searchTerm: '',
};

const initMainPageState: IMainPageState = {
  openProjectId: null,
};

const initProjectsState: IProjectsState = {
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
      },
      id: 'test',
      name: 'Testing'
    },
    vickyTest: {
      files: [],
      hydroShareResource: {
        id: 'vickyTest',
        author: 'Vicky McDermott',
        lastModified: 'Sep 13',
        status: 'Modified',
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
  let selectedFilesAndFolders: Set<string>;
  switch (action.type) {
    case ProjectDetailsPageActions.TOGGLE_IS_SELECTED_ALL:
      selectedFilesAndFolders = new Set(state.selectedFilesAndFolders);
      const doMakeSelected = !state.allSelected;
      action.payload.files.forEach(projectFileOrFolder => {
        selectedFilesAndFolders = recursivelySetSelectedState(selectedFilesAndFolders, projectFileOrFolder, doMakeSelected);
      });
      return {
        ...state,
        allSelected: doMakeSelected,
        selectedFilesAndFolders,
      };
    case ProjectDetailsPageActions.TOGGLE_IS_SELECTED_ONE:
      selectedFilesAndFolders = new Set(state.selectedFilesAndFolders);
      const fileOrFolder = action.payload;
      const itemWasSelected = selectedFilesAndFolders.has(fileOrFolder.dirPath + fileOrFolder.name);
      selectedFilesAndFolders = recursivelySetSelectedState(selectedFilesAndFolders, action.payload, !itemWasSelected);
      console.log(selectedFilesAndFolders);
      return {
        ...state,
        allSelected: false,
        selectedFilesAndFolders,
      };
    default:
      return state;
  }
}

export function projectsPageReducer(state: IProjectsPageState = initProjectsPageState, action: AllActionTypes): IProjectsPageState {
  switch (action.type) {
    case FilterBarActions.SELECT_ALL:
      return {...state, selectAll: !state.selectAll};
    case FilterBarActions.SEARCH_BY:
      return {...state, searchTerm: action.payload};
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
