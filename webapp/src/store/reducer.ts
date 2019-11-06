import {
  FilterBarActions, ResourceListActions,
} from './actions/action-names';
import {
  FilterBarActionTypes,
  IFilterBarState,
  IUserState,
  UserActionTypes,
  IResourceListState,
  ResourceListActionTypes,
} from './types';

const initFilterBarState: IFilterBarState = {
  selectAll: false,
  sortBy: 'Name'
};

const initUserState: IUserState = {
  name: 'Kyle Combes',
};

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

export function userReducer(state: IUserState = initUserState, action: UserActionTypes): IUserState {
  switch (action.type) {
    // TODO: Something useful
    default:
      return state;
  }
}
