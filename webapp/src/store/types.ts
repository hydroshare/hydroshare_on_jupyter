import {ActionType} from 'typesafe-actions';

import * as mainPageActions from './actions/App';
import * as filterActions from './actions/FilterBar';
import * as projectsActions from './actions/projects';
import * as userActions from './actions/user';
import * as resourceListActions from './actions/ResourceList';

export type FilterBarActionTypes = ActionType<typeof filterActions>;
export type MainPageActionTypes = ActionType<typeof mainPageActions>;
export type ProjectsActionTypes = ActionType<typeof projectsActions>;
export type UserActionTypes = ActionType<typeof userActions>;
export type ResourceListActionTypes = ActionType<typeof resourceListActions>;

export type AllActionTypes = (
  FilterBarActionTypes
  | MainPageActionTypes
  | UserActionTypes
  | ResourceListActionTypes
);


export interface IRootState {
  mainPage: IMainPageState
  filter: IFilterBarState
  projects: IProjectsState
  user: IUserState
  resourceList: IResourceListState
}

export interface IFilterBarState {
  selectAll: boolean
  sortBy: string
}

export interface IFileOrFolder {
  contents?: IFileOrFolder[] // If a folder, a list of its contents
  lastModified?: Date
  name: string
  type: string
  size: number
}

export interface IJupyterProject {
  files: IFileOrFolder[]
  name: string
  readmeMarkdown?: string
}

export interface IMainPageState {
  openProjectId: string | null
}

// TODO: Rename this (and its associated reducer) to something better
export interface IProjectsState {
  allProjects: {
    [projectId: string]: IJupyterProject
  }
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