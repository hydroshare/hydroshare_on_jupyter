import { TResourceFile } from "./types";

export interface ISuccess {
  success: boolean;
}

export interface ICredentials {
  username: string;
  password: string;
}

export interface IResourceMetadata {
  resource_type: string;
  resource_title: string;
  resource_id: string;
  immutable: boolean;
  resource_url: string;
  creator: string;
  date_created: string;
  date_last_updated: string;
}
export interface IResourceFiles {
  files: TResourceFile[];
}

export interface IResourceFilesRequest extends IResourceFiles {
  resource_id: string;
}

export interface IResourceFileDownloadRequest {
  resource_id: string;
  file: string;
}

export interface IUserInfo {
  name: string;
  email: string;
  url: string;
  phone: string;
  address: string;
  organization: string;
  website: string;
  identifiers: { EUserIdentifierType: string };
}

export interface IDataDirectory {
  data_directory: string;
}
