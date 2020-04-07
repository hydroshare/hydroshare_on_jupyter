import { RouterState } from 'connected-react-router';
import * as moment from 'moment';
import {ActionType} from 'typesafe-actions';

import * as resourcesActions from './actions/resources';
import * as userActions from './actions/user';
import * as resourcePageActions from './actions/ResourcePage';

export type ResourcePageActionTypes = ActionType<typeof resourcePageActions>;
export type ResourcesActionTypes = ActionType<typeof resourcesActions>;
export type UserActionTypes = ActionType<typeof userActions>;

export interface INotificationsState {
  current: INotification[]
}

export interface IRootState {
  notifications: INotificationsState
  resources: IResourcesState
  resourcePage: IResourcePageState
  router: RouterState
  user: IUserInfo | null
}

export interface IResourcePageState {
  allJupyterSelected: boolean
  allHydroShareSelected: boolean
  selectedLocalFilesAndFolders: Set<string>
  selectedHydroShareFilesAndFolders: Set<string>
  searchTerm: string
  sortBy?: SortByOptions
}

export interface IFile {
  path: string // If a folder, no trailing forward slash
  lastModified?: moment.Moment
  name: string
  type: FileOrFolderTypes
  sizeBytes: number
}

export interface IFolder extends IFile {
  contents: (IFile | IFolder)[]
}

export interface IJupyterResource {
  id: string
  localCopyExists: boolean
  jupyterHubFiles: IFolder
  title: string
  readmeMarkdown?: string
  hydroShareResource: IHydroShareResourceInfo
}

export interface INotification {
  message: string
  time: Date
  type: 'error' | 'warning'
}

// TODO: Rename this (and its associated reducer) to something better
export interface IResourcesState {
  allResources: {
    [resourceId: string]: IJupyterResource
  }
  resourceLocalFilesBeingFetched: Set<string>
  resourceHydroShareFilesBeingFetched: Set<string>
  // TODO: Figure out where this is used and move it to that reducer
  searchTerm: string,
}

export interface IUserInfoDataResponse {
  data: {
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
  error?: IServerError
  success: boolean
}

export interface IResourcesData {
  resources: IJupyterResource[]
}

export interface IResourceFilesData {
  rootDir: IFolder
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
  files: IFolder
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

export enum FileOrFolderTypes {
  FOLDER = 'folder',
  FILE = 'file',
}

export interface ICreateResourceRequest {
  name: string,
  privacy: string
}

export interface IServerError {
  type: string
  message: string
}

export interface IFileOperationsRequestResponse {
  failureCount: number
  results: [{
    success: boolean
    error?: IServerError
    message?: string
  }]
  successCount: number
}

export interface ICreateFileOrFolderRequestResponse {
  success: boolean
}
