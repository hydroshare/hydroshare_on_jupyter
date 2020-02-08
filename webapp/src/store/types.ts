import { RouterState } from 'connected-react-router';
import * as moment from 'moment';
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
  router: RouterState
  user: IUserInfo | null
}

export interface IProjectDetailsPageState {
  allJupyterSelected: boolean
  allHydroShareSelected: boolean
  selectedLocalFilesAndFolders: Set<string>
  selectedHydroShareFilesAndFolders: Set<string>
  searchTerm: string
  sortBy?: SortByOptions
}

export interface IProjectsPageState {
  allSelected: boolean
  sortBy?: SortByOptions
  searchTerm: string
}

export interface IFileOrFolder {
  contents?: IFileOrFolder[] // If a folder, a list of its contents
  dirPath: string // The path to the folder containing this file relative to the project root (must end with trailing /)
  lastModified?: moment.Moment
  name: string
  type: string
  sizeBytes: number
}

export interface IJupyterProject {
  id: string
  localCopyExists: boolean
  files: IFileOrFolder[]
  title: string
  readmeMarkdown?: string
  hydroShareResource: IHydroShareResourceInfo
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

export interface IUserInfoData {
  email: string
  first_name: string
  id: number
  last_name: string
  organization: string
  title: string
  username: string
  zip: {
    fire: string
  }
}

export interface IResourcesData {
  resources: IJupyterProject[]
}

export interface IResourceFilesData {
  files: IFileOrFolder[]
}

export interface IUserInfo {
  email: string
  id: number
  name: string
  organization: string
  title: string
  username: string
}

export interface IHydroShareResourceInfo {
  resource_id: string
  author: string
  files: IFileOrFolder[]
  date_last_updated: moment.Moment
  status: string
  resource_type: string
  resource_title: string
  abstract?: string
  authors: string[]
  doi?: string
  date_created: string
  public: boolean
  discoverable: boolean
  shareable: boolean
  immutable: boolean
  published: boolean
  bag_url: string
  science_metadata_url: string
  resource_url: string
}

export enum SortByOptions {
  Name = 'NAME',
  Date = 'DATE',
  Status = 'STATUS',
  Author = 'AUTHOR',
  Type = 'TYPE'
}

export interface ICreateNewResource {
  name: string,
  privacy: string
}
