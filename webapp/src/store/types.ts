import { RouterState } from "connected-react-router";
import * as moment from "moment";
import { ActionType } from "typesafe-actions";

import * as resourcesActions from "./actions/resources";
import * as userActions from "./actions/user";
import * as directoryActions from "./actions/directory";

export type ResourcesActionTypes = ActionType<typeof resourcesActions>;
export type UserActionTypes = ActionType<typeof userActions>;
export type DirectoryActionTypes = ActionType<typeof directoryActions>;
/** ---------- Enums ---------- **/

export enum FileOrFolderTypes {
  FOLDER = "folder",
  FILE = "file",
}

export const NEW_FILE_OR_FOLDER_TYPES = {
  FOLDER: "Folder",
  JUPYTER_NOTEBOOK: "Jupyter Notebook (.ipynb)",
  OTHER_FILE: "Other File",
};

export const PATH_PREFIXES = {
  HYDROSHARE: "hs",
  LOCAL: "local",
};

/** ---------- Redux State ---------- **/

export interface IRootState {
  notifications: INotificationsState;
  resources: IResourcesState;
  router: RouterState;
  user: IUserState;
  directory: IDirectoryState;
}

export interface INotificationsState {
  current: INotification[];
}

export interface IResourcesState {
  allResources: {
    [resourceId: string]: IResource;
  };
  fetchingResources: boolean;
  resourceLocalFilesBeingFetched: Set<string>;
  resourceHydroShareFilesBeingFetched: Set<string>;
  archiveMessage: string;
}

export interface IUserState {
  attemptingLogin: boolean;
  authenticationFailed: boolean;
  credentialsInvalid: boolean;
  checkingFile: boolean;
  userInfo?: IUserInfo;
}

export interface IDirectoryState {
  dirResponse: string;
  dirErrorResponse: string;
  fileSavedResponse: boolean;
}
/** --------- Data Models --------- **/

export interface IFile {
  syncStatus: string;
  path: string; // If a folder, no trailing forward slash
  modifiedTime?: moment.Moment;
  name: string;
  type: FileOrFolderTypes;
  sizeBytes: number;
  fileChanged: string;
}
export interface ISync {
  resourceId: string;
  filesChanged: string;
  modifiedTimeHydroShare?: string;
  modifiedTimeLocal?: string;
  fileName: string;
  filePath: string;
}
export interface IFolder extends IFile {
  contents: (IFile | IFolder)[];
}

export interface IResource {
  abstract?: string;
  authors: string[];
  creator: string;
  created: moment.Moment;
  lastUpdated: moment.Moment;
  hydroShareFiles: IFolder;
  id: string;
  localCopyExists: boolean;
  localFiles: IFolder;
  public: boolean;
  published: boolean;
  readmeMarkdown?: string;
  status: string;
  title: string;
  resource_title: string;
  resource_url: string;
  localReadMe: string;
  hydroShareReadMe: string;
}

export interface INotification {
  message: string;
  time: Date;
  type: "error" | "warning";
}

export interface IResourcesData {
  resources: IResource[];
  archive_message: string;
  success: boolean;
  error?: IServerError;
}

export interface IResourceMetadata {
  resource_type: string;
  resource_title: string;
  resource_id: string;
  immutable: boolean;
  resource_url: string;
}

export interface ICollectionOfResourceMetadata
  extends Array<IResourceMetadata> {}

export interface IResourceFilesData {
  rootDir: IFolder;
  readMe: string;
  error?: IServerError;
  filesChanged: string;
  modified_time: Date;
  myJson: ISync;
}
export interface ICheckSync {
  filesChanged: string;
  modified_time: string;
  rootDir: IFolder;
  readMe: string;
}
export interface IUserInfo {
  email: string;
  id: number;
  name: string;
  organization: string;
  title: string;
  username: string;
}
export interface IDirectoryInfo {
  success: string;
  error?: string;
  isFile: boolean;
  configDataPath: string;
}
/** --------- Backend Server Communication ---------- **/

export interface IAttemptHydroShareLoginResponse {
  success: boolean;
  userInfo: IUserInfo;
  isFile: boolean;
}

export interface ICreateFileOrFolderRequestResponse {
  success: boolean;
  error?: IServerError;
}

export interface ICreateResourceRequest {
  abstract: string;
  title: string;
  privacy: string;
}

export interface ICreateResourceRequestResponse {
  success: boolean;
  error?: IServerError;
}

export interface IFileOperationsRequestResponse {
  failureCount: number;
  results: [
    {
      success: boolean;
      error?: IServerError;
      message?: string;
    }
  ];
  successCount: number;
}

export interface IUserInfoDataResponse2 {
  name: string;
  email: string;
  url: string;
  phone: string;
  address: string;
  organization: string;
  website: string;
  identifiers: any; // TODO: this will need to change in the future.
}

export interface IUserInfoDataResponse {
  data: {
    email: string;
    first_name: string;
    id: number;
    last_name: string;
    organization: string;
    title: string;
    username: string;
    zip: {
      fire: string;
    };
  };
  error?: IServerError;
  success: boolean;
  isFile: boolean;
}

export interface IDeleteResourceRequestResponse {
  success: boolean;
  error?: IServerError;
}

export interface IServerError {
  type: string;
  message: string;
}
