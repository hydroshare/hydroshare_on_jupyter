// TODO (kyle): get rid of actions altogether & move contents to other files
import axios, { AxiosResponse } from "axios";
import { AnyAction } from "redux";
import { ThunkAction, ThunkDispatch } from "redux-thunk";
import { loadInitData } from "./actions/App";

import { dismissNotification, pushNotification } from "./actions/notifications";
import {
  notifyGettingResourceHydroShareFiles,
  notifyGettingResourceJupyterHubFiles,
  notifyGettingResources,
  notifyGettingResourcesFailed,
  notifyGettingWorkspaceFilesFailed,
  setArchiveMessage,
  setResourceHydroShareFiles,
  setResourceLocalFiles,
  // setResources,
  setResources2,
  //getFilesStatusChanged,
} from "./actions/resources";
import {
  notifyHydroShareCredentialsInvalid,
  setUserInfo,
} from "./actions/user";
import * as UserActions from "./actions/user";
import {
  FileOrFolderTypes,
  IAttemptHydroShareLoginResponse,
  ICreateFileOrFolderRequestResponse,
  ICreateResourceRequest,
  ICreateResourceRequestResponse,
  IDeleteResourceRequestResponse,
  IFile,
  IFileOperationsRequestResponse,
  IFolder,
  IResource,
  IResourceFilesData,
  IResourcesData,
  IRootState,
  IServerError,
  IUserInfoDataResponse,
  IUserInfoDataResponse2,
  ICollectionOfResourceMetadata,
  NEW_FILE_OR_FOLDER_TYPES,
  PATH_PREFIXES,
  IDirectoryInfo,
  ICheckSync,
} from "./types";
import * as DirectoryActions from "./actions/directory";
import { Redirect } from "react-router";
// import FilePane from 'src/components/FilePane';
// import { NotificationsActions } from './actions/action-names';

// @ts-ignore
const BACKEND_URL = window.BACKEND_API_URL || "//localhost:8080/syncApi";

function _get_cookie(name: string) {
  // from tornado docs: http://www.tornadoweb.org/en/stable/guide/security.html
  const r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
  return r ? r[1] : undefined;
}

const XSRF_TOKEN = _get_cookie("_xsrf");

const backendApi = axios.create({
  headers: {
    "X-XSRFToken": XSRF_TOKEN,
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

function deleteToBackend<T>(
  endpoint: string,
  data: any = undefined
): Promise<AxiosResponse<T>> {
  return backendApi.delete<T>(BACKEND_URL + endpoint, { data });
}
function getFilesFromBackend<T>(
  endpoint: string,
  data: any = undefined
): Promise<AxiosResponse<T>> {
  return backendApi.get<T>(BACKEND_URL + endpoint, { data });
}
function getFromBackend<T>(endpoint: string): Promise<AxiosResponse<T>> {
  return backendApi.get<T>(BACKEND_URL + endpoint);
}

function patchToBackend<T>(
  endpoint: string,
  data: any
): Promise<AxiosResponse<T>> {
  return backendApi.patch<T>(BACKEND_URL + endpoint, data);
}

function postToBackend<T>(
  endpoint: string,
  data: any
): Promise<AxiosResponse<T>> {
  return backendApi.post<T>(BACKEND_URL + endpoint, data);
}

function putToBackend<T>(
  endpoint: string,
  data: any
): Promise<AxiosResponse<T>> {
  return backendApi.put<T>(BACKEND_URL + endpoint, data);
}

function handleError(
  error: IServerError,
  dispatch: ThunkDispatch<{}, {}, AnyAction>
) {
  if (error.type === "HydroShareAuthenticationError") {
    dispatch(notifyHydroShareCredentialsInvalid());
  }
  if (error.type === "WorkspaceFileError") {
    dispatch(notifyGettingWorkspaceFilesFailed());
  } else {
    dispatch(pushNotification("error", error.message));
  }
}
export function createNewFileOrFolder(
  resource: IResource,
  name: string,
  type: string
): ThunkAction<Promise<void>, {}, {}, AnyAction> {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    try {
      let itemType;
      switch (type) {
        case NEW_FILE_OR_FOLDER_TYPES.FOLDER:
          itemType = "folder";
          break;
        case NEW_FILE_OR_FOLDER_TYPES.JUPYTER_NOTEBOOK:
          if (!name.endsWith(".ipynb")) {
            name += ".ipynb";
          }
          itemType = "file";
          break;
        case NEW_FILE_OR_FOLDER_TYPES.OTHER_FILE:
          itemType = "file";
          break;
      }
      const data = {
        type: itemType,
        name,
      };
      const response = await putToBackend<ICreateFileOrFolderRequestResponse>(
        `/resources/${resource.id}/local-files`,
        data
      );
      const { success, error } = response.data;
      if (success) {
        //dispatch(getResourceLocalFiles(resource));
        dispatch(getResourceDownloadedLocalFiles(resource));
        dispatch(getResourceHydroShareFiles(resource));
      } else {
        if (error) {
          handleError(error, dispatch);
        } else {
          dispatch(
            pushNotification(
              "error",
              "An error occurred when attempting to create the file or folder."
            )
          );
        }
      }
    } catch (e) {
      console.error(e);
      dispatch(
        pushNotification(
          "error",
          "An error occurred when attempting to create the file or folder."
        )
      );
    }
  };
}

export function createNewResource(
  details: ICreateResourceRequest
): ThunkAction<Promise<void>, IRootState, {}, AnyAction> {
  return async (
    dispatch: ThunkDispatch<IRootState, {}, AnyAction>,
    getState: () => IRootState
  ) => {
    dispatch(notifyGettingResources());
    const {
      user: { userInfo },
    } = getState();
    try {
      const data = {
        ...details,
        creators: [userInfo?.name],
      };
      const response = await postToBackend<ICreateResourceRequestResponse>(
        `/resources`,
        data
      );
      const { success, error } = response.data;
      if (success) {
        dispatch(getResources());
      } else {
        if (error) {
          handleError(error, dispatch);
        } else {
          dispatch(pushNotification("error", "Could not create resource."));
        }
      }
    } catch (e) {
      console.error(e);
      dispatch(
        pushNotification(
          "error",
          "An error occurred when attempting to create the resource."
        )
      );
    }
  };
}

export function downloadResourceFilesOrFolders(
  resource: IResource,
  paths: string[]
): ThunkAction<Promise<void>, {}, {}, AnyAction> {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    let localFiles: string[] = [];
    let hsFiles: string[] = [];
    paths.forEach((p) => {
      let [prefix, pathRelRoot] = p.split(":");
      if (prefix === "local") {
        localFiles.push(pathRelRoot);
      } else if (prefix === "hs") {
        hsFiles.push(pathRelRoot);
      }
    });
    if (hsFiles.length > 0) {
      try {
        const response = await postToBackend<IResourceFilesData>(
          `/resources/${resource.id}/download-hs-files`,
          {
            files: hsFiles,
          }
        );
        const {
          data: { rootDir, readMe, error },
        } = response;
        if (error) {
          handleError(error, dispatch);
        } else {
          dispatch(setResourceLocalFiles(resource.id, rootDir, readMe));
          //dispatch(getResourceDownloadedLocalFiles(resource));
          dispatch(getResourceHydroShareFiles(resource));
          dispatch(getResourceDownloadedLocalFiles(resource));
        }
      } catch (e) {
        console.error(e);
        dispatch(
          pushNotification(
            "error",
            "An error occurred when trying to get the workspace files."
          )
        );
      }
    }
  };
}

export function checkSyncStatusFiles(
  resource: IResource,
  paths: string[]
): ThunkAction<Promise<void>, {}, {}, AnyAction> {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    let localFiles: string[] = [];
    let hsFiles: string[] = [];
    paths.forEach((p) => {
      let [prefix, pathRelRoot] = p.split(":");
      if (prefix === "local") {
        localFiles.push(pathRelRoot);
      } else if (prefix === "hs") {
        hsFiles.push(pathRelRoot);
      }
    });
    if (localFiles.length == 0) {
      try {
        const response = await getFromBackend<IResourceFilesData>(
          `/resources/${resource.id}/downloaded-local-files`
        );
        const {
          data: { rootDir, readMe, error },
        } = response;
        if (error) {
          handleError(error, dispatch);
        } else {
          dispatch(setResourceLocalFiles(resource.id, rootDir, readMe));
        }
      } catch (e) {
        console.error(e);
        dispatch(
          pushNotification(
            "error",
            "An error occurred when trying to get the workspace files."
          )
        );
      }
    }
  };
}
export function checkSyncHydroShareStatusFiles(
  resource: IResource,
  paths: string[]
): ThunkAction<Promise<void>, {}, {}, AnyAction> {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    let localFiles: string[] = [];
    let hsFiles: string[] = [];
    paths.forEach((p) => {
      let [prefix, pathRelRoot] = p.split(":");
      if (prefix === "local") {
        localFiles.push(pathRelRoot);
      } else if (prefix === "hs") {
        hsFiles.push(pathRelRoot);
      }
    });
    if (hsFiles.length == 0) {
      try {
        const response = await getFromBackend<IResourceFilesData>(
          `/resources/${resource.id}/hs-files`
        );
        const {
          data: { rootDir, readMe, error },
        } = response;
        if (error) {
          handleError(error, dispatch);
        } else {
          dispatch(setResourceLocalFiles(resource.id, rootDir, readMe));
          dispatch(getResourceHydroShareFiles(resource));
          //dispatch(getResourceDownloadedLocalFiles(resource));
        }
      } catch (e) {
        console.error(e);
        dispatch(
          pushNotification(
            "error",
            "An error occurred when trying to get the HydroShare files."
          )
        );
      }
    }
  };
}

export function deleteResources(
  resources: IResource[],
  localOnly: boolean
): ThunkAction<Promise<void>, {}, {}, AnyAction> {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    let completedRequests = 0;
    let successfulRequests = 0;
    const data = {
      locallyOnly: localOnly,
    };
    resources.forEach((resource) => {
      deleteToBackend<IDeleteResourceRequestResponse>(
        "/resources/" + resource.id,
        data
      )
        .then((res) => {
          if (res.data) {
            const { error } = res.data;
            if (error) {
              console.error(error);
              if (error.message) {
                dispatch(pushNotification("error", error.message));
              }
            }
          }
          ++successfulRequests;
        })
        .catch((error) => {
          console.error(error);
          dispatch(
            pushNotification(
              "error",
              `Could not delete resource ${resource.title}.`
            )
          );
        })
        .finally(() => {
          ++completedRequests;
          if (
            completedRequests === resources.length &&
            successfulRequests > 0
          ) {
            dispatch(getResources());
          }
        });
    });
  };
}

export function deleteResourceFilesOrFolders(
  resource: IResource,
  paths: string[]
): ThunkAction<Promise<void>, {}, {}, AnyAction> {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    let localFiles: string[] = [];
    let hsFiles: string[] = [];
    paths.forEach((p) => {
      let [prefix, pathRelRoot] = p.split(":");
      if (prefix === "local") {
        localFiles.push(pathRelRoot);
      } else if (prefix === "hs") {
        hsFiles.push(pathRelRoot);
      }
    });
    if (localFiles.length > 0) {
      dispatch(notifyGettingResourceJupyterHubFiles(resource));
      deleteToBackend(`/resources/${resource.id}/local-files`, {
        files: localFiles,
      })
        .then(() => {
          //dispatch(getResourceLocalFiles(resource));
          dispatch(getResourceDownloadedLocalFiles(resource));
          dispatch(getResourceHydroShareFiles(resource));
        })
        .catch((error) => {
          console.error(error);
          dispatch(
            pushNotification("error", "Could not delete files in JupyterHub.")
          );
        });
    }
    if (hsFiles.length > 0) {
      dispatch(notifyGettingResourceHydroShareFiles(resource));
      deleteToBackend(`/resources/${resource.id}/hs-files`, {
        files: hsFiles,
      })
        .then(() => {
          dispatch(getResourceDownloadedLocalFiles(resource));
          dispatch(getResourceHydroShareFiles(resource));
        })
        .catch((error) => {
          console.error(error);
          dispatch(
            pushNotification("error", "Could not delete files in HydroShare.")
          );
        });
    }
  };
}

export function uploadNewFile(
  resource: IResource,
  file: FormData
): ThunkAction<Promise<void>, {}, {}, AnyAction> {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    try {
      const response = await postToBackend<IAttemptHydroShareLoginResponse>(
        `/resources/${resource.id}/local-files`,
        file
      );
      if (response.data.success) {
        dispatch(loadInitData());
        dispatch(getResourceHydroShareFiles(resource));
      }
    } catch (e) {
      console.error(e);
      dispatch(pushNotification("error", "Could not upload file."));
    }
  };
}

export function uploadNewDir(
  dirPath: string,
  choice: string
): ThunkAction<Promise<void>, {}, {}, AnyAction> {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    const body = {
      dirpath: dirPath,
      choice: choice,
    };
    try {
      const response = await postToBackend<IDirectoryInfo>("/selectdir", body);
      dispatch(loadInitData());
      if (response.data.success) {
        dispatch(loadInitData());
        dispatch(
          DirectoryActions.notifyDirectoryResponse(response.data.success)
        );
        //set window object to new config data path
        const config = response.data.configDataPath;
        console.log("response from server is", config);
        // @ts-ignore
        window.NOTEBOOK_URL_PATH_PREFIX = config;
        // `${window.NOTEBOOK_URL_PATH_PREFIX}` = response.data.configDataPath
        //dispatch(DirectoryActions.notifyFileSavedResponse(response.data.isFile))
        console.log("Checking if File exists", response.data.isFile);
      }
      if (response.data.error) {
        dispatch(loadInitData());
        dispatch(
          DirectoryActions.notifyDirectoryErrorResponse(response.data.error)
        );
        dispatch(pushNotification("error", response.data.error));
        //dispatch(DirectoryActions.notifyDirectoryResponse(response.data.error));
        console.log("response.data");
      }
    } catch (e) {
      console.error(e);
      // @ts-ignore
      dispatch(pushNotification("error", e));
    }
  };
}

export function loginToHydroShare(
  username: string,
  password: string,
  remember: boolean
): ThunkAction<Promise<void>, {}, {}, AnyAction> {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    dispatch(UserActions.notifyAttemptingHydroShareLogin());
    try {
      const response = await postToBackend<IAttemptHydroShareLoginResponse>(
        "/login",
        { username, password, remember }
      );
      dispatch(
        UserActions.notifyReceivedHydroShareLoginResponse(response.data.success)
      );
      if (response.data.success) {
        if (response.data.isFile == true) {
          dispatch(
            UserActions.checkDirectorySavedResonse(response.data.isFile)
          );
          dispatch(loadInitData());
        }
        //dispatch(loadInitData());
        //if(UserActions.checkDirectorySavedResonse == true){
        //dispatch(loadInitData());
        //}
        //console.log('Data through Response is', response.data.isFile)
        //dispatch(loadInitData());
        dispatch(setUserInfo(response.data.userInfo));
        //dispatch(loadInitData());
      }
    } catch (e) {
      console.error(e);
      dispatch(pushNotification("error", "Could not login."));
      dispatch(UserActions.notifyReceivedHydroShareLoginResponse(false));
    }
  };
}
export function logoutToHydroShare(): ThunkAction<
  Promise<void>,
  {},
  {},
  AnyAction
> {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    try {
      const response = await deleteToBackend<IAttemptHydroShareLoginResponse>(
        "/login"
      );
      let tempCookie = document.cookie;
      console.log("temp cookie is", tempCookie);
      tempCookie = "_xsrf= ";
      dispatch(UserActions.removeUserInfo(true));
      if (response.status === 200) {
        dispatch(UserActions.notifyReceivedHydroShareLoginResponse(false));
      }
    } catch (e) {
      window.alert("Cannot logout!");
      console.error(e);
      dispatch(pushNotification("error", "Could not logout."));
      dispatch(UserActions.notifyReceivedHydroShareLoginResponse(true));
    }
  };
}

export function getUserInfo(): ThunkAction<Promise<void>, {}, {}, AnyAction> {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    try {
      const response = await getFromBackend<IUserInfoDataResponse2>("/user");
      const data = response.data;
      //   if (error) {
      //     if (response.data.data == null){
      //       handleError(error, dispatch);
      //       dispatch(dismissNotification(0));
      //     }
      // }
      // else {
      const userInfo = {
        email: data.email,
        id: 0,
        name: data.name,
        organization: data.organization,
        title: "null",
        username: "null",
      };

      // dispatch(UserActions.checkDirectorySavedResonse(response.data.isFile))
      dispatch(UserActions.setUserInfo(userInfo));
      // }
    } catch (e) {
      console.error(e);
      dispatch(
        pushNotification(
          "error",
          "Could not get user information from the server."
        )
      );
    }
  };
}

// function that returns user id and redirects to profile page in HydroShare
export function viewUserProfile(): ThunkAction<
  Promise<void>,
  {},
  {},
  AnyAction
> {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    try {
      const response = await getFromBackend<IUserInfoDataResponse>("/user");
      // const {
      //   data,
      //   error,
      //   isFile
      // } = response.data;
      // if (error) {
      //   handleError(error, dispatch);
      // } else {
      //   const userInfo = {
      //     email: data.email,
      //     id: data.id,
      //   };
      //   window.open(`https://www.hydroshare.org/user/${userInfo.id}/`, '_blank');
      //   // dispatch(UserActions.checkDirectorySavedResonse(response.data.isFile))
      //   // dispatch(UserActions.setUserInfo(userInfo));
      // }
    } catch (e) {
      console.error(e);
      dispatch(
        pushNotification(
          "error",
          "Could not get user information from the server."
        )
      );
    }
  };
}

export function getResources(): ThunkAction<Promise<void>, {}, {}, AnyAction> {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    dispatch(notifyGettingResources());
    try {
      const response = await getFromBackend<ICollectionOfResourceMetadata>(
        "/resources"
      );
      const data = response.data;
      // if (error) {
      //   //handleError(error, dispatch);
      // } else {

      dispatch(setResources2(data));

      // dispatch(setArchiveMessage(archive_message));
      // }
    } catch (e) {
      //console.error(e);
      dispatch(notifyGettingResourcesFailed());
      dispatch(
        pushNotification("error", "Could not get resources from the server.")
      );
    }
  };
}

export function getResourceLocalFiles(resource: IResource) {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    dispatch(notifyGettingResourceJupyterHubFiles(resource));
    try {
      const response = await getFromBackend<IResourceFilesData>(
        `/resources/${resource.id}/local-files`
      );
      const {
        data: { rootDir, readMe, error },
      } = response;
      if (error) {
        handleError(error, dispatch);
      } else {
        dispatch(setResourceLocalFiles(resource.id, rootDir, readMe));
      }
    } catch (e) {
      console.error(e);
      dispatch(
        pushNotification(
          "error",
          "An error occurred when trying to get the workspace files."
        )
      );
    }
  };
}
export function getResourceDownloadedLocalFiles(resource: IResource) {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    dispatch(notifyGettingResourceJupyterHubFiles(resource));
    try {
      const response = await getFromBackend<IResourceFilesData>(
        `/resources/${resource.id}/downloaded-local-files`
      );
      const {
        data: { rootDir, readMe, error },
      } = response;
      if (error) {
        handleError(error, dispatch);
      }
      if (rootDir == null) {
        dispatch(pushNotification("warning", "files not in workspace"));
      } else {
        console.log("trying to dismiss notification");
        //NotificationsActions.DISMISS_NOTIFICATION
        dispatch(dismissNotification(0));
        //dismissNotification(0);
        dispatch(setResourceLocalFiles(resource.id, rootDir, readMe));
      }
    } catch (e) {
      console.error("error is", e);
      dispatch(
        pushNotification(
          "error",
          "An error occurred when trying to get the workspace files."
        )
      );
    }
  };
}

export function getResourceHydroShareFiles(resource: IResource) {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    dispatch(notifyGettingResourceHydroShareFiles(resource));
    try {
      const response = await getFromBackend<IResourceFilesData>(
        `/resources/${resource.id}/hs-files`
      );
      const {
        data: { rootDir, error },
      } = response;
      if (error) {
        handleError(error, dispatch);
      } else {
        dispatch(setResourceHydroShareFiles(resource.id, rootDir));
      }
    } catch (e) {
      console.error(e);
      dispatch(
        pushNotification(
          "error",
          "An error occurred when trying to get the HydroShare files."
        )
      );
    }
  };
}

export function copyFileOrFolder(
  resource: IResource,
  source: IFile | IFolder,
  destination: IFolder
) {
  return performFileOperation(resource, source, destination, "copy");
}

export function renameFileOrFolder(
  resource: IResource,
  source: string,
  destination: string
) {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    const localBeingModified = source.startsWith(PATH_PREFIXES.LOCAL);
    const hsBeingModified = source.startsWith(PATH_PREFIXES.HYDROSHARE);
    const data = {
      operations: [
        {
          method: "move",
          source,
          destination,
        },
      ],
    };
    if (localBeingModified) {
      dispatch(notifyGettingResourceJupyterHubFiles(resource));
    }
    if (hsBeingModified) {
      dispatch(notifyGettingResourceHydroShareFiles(resource));
    }
    const response = await patchToBackend<IFileOperationsRequestResponse>(
      `/resources/${resource.id}/move-copy-files`,
      data
    );
    // Handle the result from the server
    const { failureCount, results, successCount } = response.data;
    // Display notifications for any errors that occurred
    if (failureCount > 0) {
      results.forEach((res) => {
        if (!res.success && res.error) {
          handleError(res.error, dispatch);
        }
      });
    }
    // Refresh the file lists if we should
    if (successCount > 0) {
      if (source.startsWith(PATH_PREFIXES.LOCAL)) {
        //dispatch(getResourceLocalFiles(resource));
        dispatch(getResourceDownloadedLocalFiles(resource));
        dispatch(getResourceHydroShareFiles(resource));
      } else {
        dispatch(getResourceHydroShareFiles(resource));
        dispatch(getResourceHydroShareFiles(resource));
      }
    }
  };
}

export function moveFileOrFolder(
  resource: IResource,
  source: IFile | IFolder,
  destination: IFolder
) {
  return performFileOperation(resource, source, destination, "move");
}

function performFileOperation(
  resource: IResource,
  source: IFile | IFolder,
  destination: IFolder,
  method: "move" | "copy"
) {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    const localBeingModified =
      destination.path.startsWith(PATH_PREFIXES.LOCAL) ||
      (method === "move" && source.path.startsWith(PATH_PREFIXES.LOCAL));
    const hsBeingModified =
      destination.path.startsWith(PATH_PREFIXES.HYDROSHARE) ||
      (method === "move" && source.path.startsWith(PATH_PREFIXES.HYDROSHARE));
    // Make the network request to perform the operation
    let fullDestPath = destination.path;
    if (!fullDestPath.endsWith("/")) {
      fullDestPath += "/";
    }
    fullDestPath += source.name;
    if (source.type && source.type !== FileOrFolderTypes.FOLDER) {
      fullDestPath += "." + (source as IFile).type;
    }
    const data = {
      operations: [
        {
          method,
          source: source.path,
          destination: fullDestPath,
        },
      ],
    };
    if (localBeingModified) {
      dispatch(notifyGettingResourceJupyterHubFiles(resource));
    }
    if (hsBeingModified) {
      dispatch(notifyGettingResourceHydroShareFiles(resource));
    }
    const response = await patchToBackend<IFileOperationsRequestResponse>(
      `/resources/${resource.id}/move-copy-files`,
      data
    );
    // Handle the result from the server
    const { failureCount, results, successCount } = response.data;
    // Display notifications for any errors that occurred
    if (failureCount > 0) {
      results.forEach((res) => {
        if (!res.success && res.error) {
          handleError(res.error, dispatch);
        }
      });
    }
    // Refresh the file lists if we should
    if (successCount > 0) {
      if (localBeingModified) {
        //dispatch(getResourceLocalFiles(resource));
        dispatch(getResourceDownloadedLocalFiles(resource));
        dispatch(getResourceHydroShareFiles(resource));
      }
      if (hsBeingModified) {
        dispatch(getResourceHydroShareFiles(resource));
        dispatch(getResourceDownloadedLocalFiles(resource));
      }
    }
  };
}
