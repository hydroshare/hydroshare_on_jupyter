import {
  FilterBarActions,
  ResourceListActions,
} from './actions/action-names';
import {
  FilterBarActionTypes,
  IFilterBarState,
  IMainPageState,
  IProjectsState,
  IUserState,
  MainPageActionTypes,
  ProjectsActionTypes,
  UserActionTypes,
  IResourceListState,
  ResourceListActionTypes,
} from './types';

const initFilterBarState: IFilterBarState = {
  selectAll: false,
  sortBy: 'Name'
};

const initMainPageState: IMainPageState = {
  openProjectId: 'test',
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
      name: 'Testing'
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

export function filterReducer(state: IFilterBarState = initFilterBarState, action: FilterBarActionTypes): IFilterBarState {
  switch (action.type) {
    case FilterBarActions.SELECT_ALL:
      return {...state, selectAll: !state.selectAll};
    default:
      return state;
  }
}

const initResourceListState: IResourceListState = {
  resources: [
    {
      name: 'The most awesome discovery',
      author: 'Kyle Combes',
      lastModified: 'May 5',
      status: 'Published',
    },
    {
      name: 'Some cool data',
      author: 'Vicky McDermott',
      lastModified: 'Sep 13',
      status: 'Modified',
    }
  ]
}

export function resourceListReducer(state: IResourceListState = initResourceListState, action: ResourceListActionTypes) {
  switch (action.type) {
    case ResourceListActions.GO_TO_FILES:
      return state;
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
