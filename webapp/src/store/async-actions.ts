// SPIFFY (Emily) should this file be moved into the actions folder?
import axios, { AxiosResponse } from 'axios';
import {
    AnyAction,
} from 'redux';
import {
  ThunkAction,
  ThunkDispatch,
} from 'redux-thunk';

import {
  pushNotification,
} from "./actions/notifications";
import {
  notifyGettingResourceHydroShareFiles,
  notifyGettingResourceJupyterHubFiles,
  setResourceLocalFiles,
  setResourceHydroShareFiles,
  setResources,
} from './actions/resources';
import {
    setUserInfo,
} from './actions/user';
import {
  IFile,
  IFileOperationsRequestResponse,
  IFolder,
  IJupyterResource,
  IResourceFilesData,
  IResourcesData,
  IUserInfoData,
} from './types';

// TODO: Remove this hardcoding
const BACKEND_URL = '//localhost:8080';

function getFromBackend<T>(endpoint: string): Promise<AxiosResponse<T>> {
    return axios.get<T>(BACKEND_URL + endpoint);
}
/*
function putToBackend<T>(endpoint: string, data: any): Promise<AxiosResponse<T>> {
  return axios.put<T>(BACKEND_URL + endpoint, data);
}
*/
function patchToBackend<T>(endpoint: string, data: any): Promise<AxiosResponse<T>> {
  return axios.patch<T>(BACKEND_URL + endpoint, data);
}

export function getUserInfo(): ThunkAction<Promise<void>, {}, {}, AnyAction> {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
      try {
          const response = await getFromBackend<IUserInfoData>('/user');
          const {
              data: {
                  email,
                  id,
                  first_name,
                  last_name,
                  organization,
                  title,
                  username,
              }
          } = response;
          const userInfo = {
              email,
              id,
              name: first_name + ' ' + last_name,
              organization,
              title,
              username,
          };
          dispatch(setUserInfo(userInfo));
      } catch (e) {
          // TODO: Display an error message
          console.error(e);
      }
  }
}

// TODO: Display an error message on failed request
export function getResources(): ThunkAction<Promise<void>, {}, {}, AnyAction> {
    return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
      const response = await getFromBackend<IResourcesData>('/resources');
      const {
          data: {
              resources,
          },
      } = response;

      dispatch(setResources(resources));
    };
}

export function getResourceLocalFiles(resource: IJupyterResource) {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    dispatch(notifyGettingResourceJupyterHubFiles(resource));
    const response = await getFromBackend<IResourceFilesData>(`/resources/${resource.id}/local-files`);
    const {
      data: {
        rootDir,
      },
    } = response;

    dispatch(setResourceLocalFiles(resource.id, rootDir));
  };
}

export function getResourceHydroShareFiles(resource: IJupyterResource) {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    dispatch(notifyGettingResourceHydroShareFiles(resource));
    const response = await getFromBackend<IResourceFilesData>(`/resources/${resource.id}/hs-files`);
    const {
      data: {
        rootDir,
      },
    } = response;

    dispatch(setResourceHydroShareFiles(resource.id, rootDir));
  };
}

export function copyFileOrFolder(resource: IJupyterResource, source: IFile | IFolder, destination: IFolder) {
  return performFileOperation(resource, source, destination, 'copy');
}

export function moveFileOrFolder(resource: IJupyterResource, source: IFile | IFolder, destination: IFolder) {
  return performFileOperation(resource, source, destination, 'move');
}

function performFileOperation(resource: IJupyterResource, source: IFile | IFolder, destination: IFolder, method: 'move' | 'copy') {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    // Make the network request to perform the operation
    const data = {
      operations: [{
        method,
        source: source.path,
        destination: destination.path,
      }],
    };
    const response = await patchToBackend<IFileOperationsRequestResponse>(`/resources/${resource.id}/move-copy-files`, data);
    // Handle the result from the server
    const {
      failureCount,
      results,
      successCount,
    } = response.data;
    // Display notifications for any errors that occurred
    if (failureCount > 0) {
      results.forEach(res => {
        if (!res.success && res.message) {
          dispatch(pushNotification('error', res.message));
        }
      });
    }
    // Refresh the file lists if we should
    if (successCount > 0) {
      // We could check to see if we need to refresh both lists
      dispatch(getResourceLocalFiles(resource));
      dispatch(getResourceHydroShareFiles(resource));
    }
  }
}
