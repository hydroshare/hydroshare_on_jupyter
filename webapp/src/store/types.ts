import {ActionType} from 'typesafe-actions';

import * as mainPageActions from './actions/App';
import * as projectsActions from './actions/projects';
import * as userActions from './actions/user';
import * as projectPageActions from './actions/projectPage';
import * as projectDetailsPageActions from './actions/ProjectDetailsPage';

export type MainPageActionTypes = ActionType<typeof mainPageActions>;
export type ProjectPageActionTypes = ActionType<typeof projectPageActions>;
export type ProjectDetailsPageActionTypes = ActionType<typeof projectDetailsPageActions>;
export type ProjectsActionTypes = ActionType<typeof projectsActions>;
export type ProjectDetailsPageActions = ActionType<typeof projectDetailsPageActions>;
export type UserActionTypes = ActionType<typeof userActions>;

export type AllActionTypes = (
  MainPageActionTypes
  | UserActionTypes
  | ProjectsActionTypes
  | ProjectPageActionTypes
  | ProjectDetailsPageActionTypes
);


export interface IRootState {
  mainPage: IMainPageState
  projectPage: IProjectsPageState
  projects: IProjectsState
  projectDetailsPage: IProjectDetailsPageState
  user: IUserState
}

export interface IProjectDetailsPageState {
  allSelected: boolean
  selectedFilesAndFolders: Set<string>
  searchTerm: string
}

export interface IProjectsPageState {
  allSelected: boolean
  sortBy: SortByOptions
  searchTerm: string
}

export interface IFileOrFolder {
  contents?: IFileOrFolder[] // If a folder, a list of its contents
  dirPath: string // The path to the folder containing this file relative to the project root (must end with trailing /)
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
  searchTerm: string,
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

export enum SortByOptions {
  Name = 'NAME',
  Date = 'DATE',
  Type = 'TYPE',
} 