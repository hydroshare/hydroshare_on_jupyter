import {
  FilterBarActions,
} from './actions/action-names';
import {
  IProjectsPageState,
  IMainPageState,
  IProjectsState,
  IUserState,
  MainPageActionTypes,
  ProjectsActionTypes,
  UserActionTypes, AllActionTypes,
} from './types';

const initProjectsPageState: IProjectsPageState = {
  allSelected: false,
  sortBy: 'Name'
};

const initMainPageState: IMainPageState = {
  openProjectId: null,
};

const initProjectsState: IProjectsState = {
  allProjects: {
    'test': {
      files: [
        {
          name: 'My glorious notebook',
          size: 73949942858,
          type: 'ipynb',
        },
        {
          contents: [
            {
              name: 'Wonderful data',
              size: 30124234233,
              type: 'csv',
            },
            {
              name: 'More wonderful data',
              size: 552434233,
              type: 'csv',
            },
            {
              name: 'Garbage data',
              size: 10029939402,
              type: 'csv',
            },
            {
              contents: [
                {
                  name: 'Stubby',
                  size: 29934423,
                  type: 'csv',
                },
              ],
              name: 'Old data',
              size: 399393,
              type: 'folder',
            },
          ],
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

export function projectsPageReducer(state: IProjectsPageState = initProjectsPageState, action: AllActionTypes): IProjectsPageState {
  switch (action.type) {
    case FilterBarActions.TOGGLE_SELECT_STATUS_ALL:
      return {...state, allSelected: !state.allSelected};
    default:
      return state;
  }
}

export function projectsReducer(state: IProjectsState = initProjectsState, action: ProjectsActionTypes): IProjectsState {
  switch (action.type) {
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
