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
  allProjects: {},
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
      const allProjects = {};
      action.payload.forEach(project => allProjects[project.hydroShareResource.resource_id] = project);
      return {...state, allProjects };
    case ProjectsActions.SET_PROJECT_LOCAL_FILES:
      const {
        resourceId,
        files,
      } = action.payload;
      return {
        ...state,
        allProjects: {
          ...state.allProjects,
          [resourceId]: {
            ...state.allProjects[resourceId],
            files,
          },
        },
      };
    case ProjectsActions.SET_PROJECT_HYDROSHARE_FILES:
      const {
        resourceId: resId,
        files: f,
      } = action.payload;
      return {
        ...state,
        allProjects: {
          ...state.allProjects,
          [resId]: {
            ...state.allProjects[resId],
            hydroShareResource: {
              ...state.allProjects[resId].hydroShareResource,
              files: f,
            },
          },
        },
      };
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
