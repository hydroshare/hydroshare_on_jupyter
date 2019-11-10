import {ActionType} from 'typesafe-actions';

import * as mainPageActions from './actions/App';
import * as projectsActions from './actions/projects';
import * as projectDetailsPageActions from './actions/ProjectDetailsPage';
import * as userActions from './actions/user';

export type MainPageActionTypes = ActionType<typeof mainPageActions>;
export type ProjectsActionTypes = ActionType<typeof projectsActions>;
export type ProjectDetailsPageActions = ActionType<typeof projectDetailsPageActions>;
export type UserActionTypes = ActionType<typeof userActions>;

export type AllActionTypes = (
  ProjectDetailsPageActions
  | MainPageActionTypes
  | UserActionTypes
);


export interface IRootState {
  mainPage: IMainPageState
  filter: IProjectsPageState
  projects: IProjectsState
  user: IUserState
}

export interface IProjectsPageState {
  allSelected: boolean
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
  id: string
  files: IFileOrFolder[]
  name: string
  readmeMarkdown?: string
  hydroShareResource?: IHydroShareResourceInfo
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

export interface IHydroShareResourceInfo {
  id: string
  author: string,
  lastModified: string,
  status: string,
}
