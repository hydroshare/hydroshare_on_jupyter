import {ActionType} from 'typesafe-actions';

import * as filterActions from './actions/FilterBar';
import * as userActions from './actions/user';
import * as resourceListActions from './actions/ResourceList';

export type FilterBarActionTypes = ActionType<typeof filterActions>;
export type UserActionTypes = ActionType<typeof userActions>;
export type ResourceListActionTypes = ActionType<typeof resourceListActions>;

export type AllActionTypes = (
  FilterBarActionTypes
  | UserActionTypes
  | ResourceListActionTypes
);


export interface IRootState {
  filter: IFilterBarState
  user: IUserState
  resourceList: IResourceListState
}

export interface IFilterBarState {
  selectAll: boolean
  sortBy: string
}

export interface IUserState {
  name: string
}

export interface IResourceInfo {
  name: string,
  author: string,
  lastModified: string,
  status: string,
}

export interface IResourceListState {
  resources: IResourceInfo[]
}