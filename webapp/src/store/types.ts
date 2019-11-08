import {ActionType} from 'typesafe-actions';

import * as mainPageActions from './actions/App';
import * as projectsActions from './actions/projects';
import * as userActions from './actions/user';
import * as projectPageActions from './actions/projectPage';

export type MainPageActionTypes = ActionType<typeof mainPageActions>;
export type ProjectPageActionTypes = ActionType<typeof projectPageActions>;
export type ProjectsActionTypes = ActionType<typeof projectsActions>;
export type UserActionTypes = ActionType<typeof userActions>;

export type AllActionTypes = (
  MainPageActionTypes
  | UserActionTypes
  | ProjectsActionTypes
  | ProjectPageActionTypes
);


export interface IRootState {
  mainPage: IMainPageState
  projectPage: IProjectsPageState
  projects: IProjectsState
  user: IUserState
}

export interface IProjectsPageState {
  selectAll: boolean
  sortBy: string
  searchTerm: string
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
