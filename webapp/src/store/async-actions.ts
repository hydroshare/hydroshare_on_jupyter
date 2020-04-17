// TODO (kyle): get rid of actions altogether & move contents to other files
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
  setArchiveMessage,
  notifyGettingResources,
  notifyGettingResourcesFailed,
} from './actions/resources';
import {
    setUserInfo,
} from './actions/user';
import {
  ICreateFileOrFolderRequestResponse,
  ICreateResourceRequest,
  ICreateResourceRequestResponse,
  IFile,
  IFileOperationsRequestResponse,
  IFolder,
  IResource,
  IResourceFilesData,
  IResourcesData,
  IRootState,
  IUserInfoDataResponse,
  NEW_FILE_OR_FOLDER_TYPES,
} from './types';

// @ts-ignore
const BACKEND_URL = window.BACKEND_API_URL || '//localhost:8080/syncApi';

function _get_cookie(name: string) {
  // from tornado docs: http://www.tornadoweb.org/en/stable/guide/security.html
  const r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
  return r ? r[1] : undefined;
}

const XSRF_TOKEN = _get_cookie('_xsrf')

const backendApi = axios.create({
    headers: {
      'X-XSRFToken': XSRF_TOKEN,
    },
});

function deleteToBackend<T>(endpoint: string, data: any = undefined): Promise<AxiosResponse<T>> {
    return backendApi.delete<T>(BACKEND_URL + endpoint, {data});
}

function getFromBackend<T>(endpoint: string): Promise<AxiosResponse<T>> {
    return backendApi.get<T>(BACKEND_URL + endpoint);
}

function patchToBackend<T>(endpoint: string, data: any): Promise<AxiosResponse<T>> {
  return backendApi.patch<T>(BACKEND_URL + endpoint, data);
}

function postToBackend<T>(endpoint: string, data: any): Promise<AxiosResponse<T>> {
  return backendApi.post<T>(BACKEND_URL + endpoint, data);
}

function putToBackend<T>(endpoint: string, data: any): Promise<AxiosResponse<T>> {
  return backendApi.put<T>(BACKEND_URL + endpoint, data);
}

export function createNewFileOrFolder(resource: IResource, name: string, type: string): ThunkAction<Promise<void>, {}, {}, AnyAction> {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    try {
      let itemType;
      switch (type) {
        case NEW_FILE_OR_FOLDER_TYPES.FOLDER:
          itemType = 'folder';
          break;
        case NEW_FILE_OR_FOLDER_TYPES.JUPYTER_NOTEBOOK:
          if (!name.endsWith('.ipynb')) {
            name += '.ipynb';
          }
          itemType = 'file';
          break;
        case NEW_FILE_OR_FOLDER_TYPES.OTHER_FILE:
          itemType = 'file';
          break;
      }
      const data = {
        type: itemType,
        name,
      };
      const response = await putToBackend<ICreateFileOrFolderRequestResponse>(`/resources/${resource.id}/local-files`, data);
      const {
        success,
        error,
      } = response.data;
      if (success) {
        dispatch(getResourceLocalFiles(resource));
      } else {
        if (error && error.message) {
          dispatch(pushNotification('error', error.message));
        } else {
          dispatch(pushNotification('error', 'An error occurred when attempting to create the file or folder.'));
        }
      }
    } catch (e) {
      console.error(e);
      dispatch(pushNotification('error', 'An error occurred when attempting to create the file or folder.'));
    }
  };
}

export function createNewResource(details: ICreateResourceRequest): ThunkAction<Promise<void>, {}, {}, AnyAction> {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>, getState: () => IRootState) => {
    const { user } = getState();
    try {
      const data = {
        ...details,
        creators: [user?.name],
      };
      const response = await postToBackend<ICreateResourceRequestResponse>(`/resources`, data);
      const {
        success,
        error,
      } = response.data;
      if (success) {
        dispatch(getResources());
      } else {
        if (error) {
          console.error(error);
          dispatch(pushNotification('error', error.message));
        } else {
          pushNotification('error', 'Could not create resource.');
        }
      }
    } catch (e) {
      console.error(e);
      dispatch(pushNotification('error', 'An error occurred when attempting to create the file.'));
    }
  };
}

export function deleteResources(resources: IResource[]): ThunkAction<Promise<void>, {}, {}, AnyAction> {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    let completedRequests = 0;
    let successfulRequests = 0;
    resources.forEach(resource => {
      deleteToBackend('/resources/' + resource.id)
        .then(() => ++successfulRequests)
        .catch(error => {
          console.error(error);
          dispatch(pushNotification('error', `Could not delete resource ${resource.title}.`));
        })
        .finally(() => {
          ++completedRequests;
          if (completedRequests === resources.length && successfulRequests > 0) {
            dispatch(getResources());
          }
        });
    });
  };
}

export function deleteResourceFilesOrFolders(resource: IResource, paths: string[]): ThunkAction<Promise<void>, {}, {}, AnyAction> {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    let localFiles: string[] = [];
    let hsFiles: string[] = [];
    paths.forEach(p => {
      let [prefix, pathRelRoot] = p.split(':');
      if (prefix === 'local') {
        localFiles.push(pathRelRoot);
      } else if (prefix === 'hs') {
        hsFiles.push(pathRelRoot);
      }
    });
    if (localFiles.length > 0) {
      deleteToBackend(`/resources/${resource.id}/local-files`, {
        files: localFiles,
      })
      .then(() => {
        dispatch(getResourceLocalFiles(resource));
      })
      .catch((error) => {
        console.error(error);
        dispatch(pushNotification('error', 'Could not delete files in JupyterHub.'));
      });
    }
    if (hsFiles.length > 0) {
      deleteToBackend(`/resources/${resource.id}/hs-files`, {
        files: hsFiles,
      })
      .then(() => {
        dispatch(getResourceHydroShareFiles(resource));
      })
      .catch((error) => {
        console.error(error);
        dispatch(pushNotification('error', 'Could not delete files in HydroShare.'));
      });
    }
  };
}

export function getUserInfo(): ThunkAction<Promise<void>, {}, {}, AnyAction> {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    try {
      const response = await getFromBackend<IUserInfoDataResponse>('/user');
      const {
        data,
        error,
      } = response.data;
      if (error) {
        console.error(error.type + ': ' + error.message);
        dispatch(pushNotification('error', error.message));
      } else {
        const userInfo = {
          email: data.email,
          id: data.id,
          name: data.first_name + ' ' + data.last_name,
          organization: data.organization,
          title: data.title,
          username: data.username,
        };
        dispatch(setUserInfo(userInfo));
      }
  } catch (e) {
      console.error(e);
      dispatch(pushNotification('error', 'Could not get user information from the server.'));
    }
  }
}

// TODO: Display an error message on failed request
export function getResources(): ThunkAction<Promise<void>, {}, {}, AnyAction> {
    return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
      dispatch(notifyGettingResources());
      try {
        const response = await getFromBackend<IResourcesData>('/resources');
        const {
          data: {
            resources,
            archive_message,
          },
        } = response;
        dispatch(setResources(resources));
        dispatch(setArchiveMessage(archive_message));
      } catch (e) {
        console.error(e);
        dispatch(notifyGettingResourcesFailed());
        dispatch(pushNotification('error', 'Could not get resources from the server.'));
      }
    };
}

export function getResourceLocalFiles(resource: IResource) {
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

export function getResourceHydroShareFiles(resource: IResource) {
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

export function copyFileOrFolder(resource: IResource, source: IFile | IFolder, destination: IFolder) {
  return performFileOperation(resource, source, destination, 'copy');
}

export function moveFileOrFolder(resource: IResource, source: IFile | IFolder, destination: IFolder) {
  return performFileOperation(resource, source, destination, 'move');
}

function performFileOperation(resource: IResource, source: IFile | IFolder, destination: IFolder, method: 'move' | 'copy') {
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
