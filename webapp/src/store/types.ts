import {ActionType} from 'typesafe-actions';

import * as filterActions from './actions/FilterBar';
import * as userActions from './actions/user';

export type FilterBarActionTypes = ActionType<typeof filterActions>;
export type UserActionTypes = ActionType<typeof userActions>;

export type AllActionTypes = (
  FilterBarActionTypes
  | UserActionTypes
);


export interface IRootState {
  filter: IFilterBarState
  user: IUserState
}

export interface IFilterBarState {
  selectAll: boolean
  sortBy: string
}

export interface IUserState {
  name: string
}
