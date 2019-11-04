import {
  FilterBarActions,
} from './actions/action-names';
import {
  FilterBarActionTypes,
  IFilterBarState,
  IUserState,
  UserActionTypes,
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

export function userReducer(state: IUserState = initUserState, action: UserActionTypes): IUserState {
  switch (action.type) {
    // TODO: Something useful
    default:
      return state;
  }
}
