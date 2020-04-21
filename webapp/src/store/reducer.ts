import * as moment from 'moment';
import { AnyAction } from 'redux';

import {
  NotificationsActions,
  ResourcesActions,
  UserInfoActions,
} from './actions/action-names';
import {
  IFile,
  IFolder,
  INotificationsState,
  IResourcesState,
  IUserState,
  ResourcesActionTypes,
  UserActionTypes,
} from './types';

const initNotificationsState: INotificationsState = {
  current: [],
};

const initResourcesState: IResourcesState = {
  allResources: {},
  fetchingResources: false,
  resourceLocalFilesBeingFetched: new Set<string>(),
  resourceHydroShareFilesBeingFetched: new Set<string>(),
  archiveMessage: "",
};

const initUserState: IUserState = {
  attemptingLogin: false,
  authenticationFailed: false,
  credentialsInvalid: false,
};

export function notificationsReducer(state: INotificationsState = initNotificationsState, action: AnyAction): INotificationsState {
  let notifications = [...state.current];
  switch (action.type) {
    case NotificationsActions.DISMISS_NOTIFICATION:
      notifications.splice(action.payload.idx, 1);
      return {
        ...state,
        current: notifications,
      };
    case NotificationsActions.PUSH_NOTIFICATION:
      notifications.push({
        ...action.payload,
        time: new Date(),
      });
      return {
        ...state,
        current: notifications,
      };
    default:
      return state;
  }
}

export function resourcesReducer(state: IResourcesState = initResourcesState, action: ResourcesActionTypes): IResourcesState {
  switch (action.type) {
    case ResourcesActions.NOTIFY_GETTING_RESOURCES:
      return {...state, fetchingResources: true};
    case ResourcesActions.SET_RESOURCES:
      const allResources = {};
      action.payload.forEach(resource => {
        resource.created = moment(resource.created, 'MM-DD-YYYY');
        resource.lastUpdated = moment(resource.lastUpdated, 'MM-DD-YYYY');
        allResources[resource.id] = resource;
      });
      return {
        ...state,
        allResources,
        fetchingResources: false,
      };
    case ResourcesActions.SET_RESOURCE_LOCAL_FILES:
      const {
        resourceId,
        rootDir,
        localReadMe,
      } = action.payload;
      rootDir.contents = recursivelyConvertDatesToMoment(rootDir.contents);
      let resourceLocFilesBeingFetched = new Set(Array.from(state.resourceLocalFilesBeingFetched));
      resourceLocFilesBeingFetched.delete(action.payload.resourceId);
      return {
        ...state,
        allResources: {
          ...state.allResources,
          [resourceId]: {
            ...state.allResources[resourceId],
            localFiles: rootDir,
            localReadMe: localReadMe,
          },
        },
        resourceLocalFilesBeingFetched: resourceLocFilesBeingFetched,
      };
    case ResourcesActions.SET_RESOURCE_HYDROSHARE_FILES:
      const {
        resourceId: resId,
        rootDir: rDir,
      } = action.payload;

      rDir.contents = recursivelyConvertDatesToMoment(rDir.contents);
      let resourceHSFilesBeingFetched = new Set(Array.from(state.resourceHydroShareFilesBeingFetched));
      resourceHSFilesBeingFetched.delete(action.payload.resourceId);
      return {
        ...state,
        allResources: {
          ...state.allResources,
          [resId]: {
            ...state.allResources[resId],
            hydroShareFiles: rDir,
          },
        },
        resourceHydroShareFilesBeingFetched: resourceHSFilesBeingFetched,
      };
    case ResourcesActions.NOTIFY_GETTING_RESOURCE_HYDROSHARE_FILES:
      let resourceHydroShareFilesBeingFetched = new Set(Array.from(state.resourceHydroShareFilesBeingFetched));
      resourceHydroShareFilesBeingFetched.add(action.payload.resourceId);
      return {
        ...state,
        resourceHydroShareFilesBeingFetched,
      };
    case ResourcesActions.NOTIFY_GETTING_RESOURCE_JUPYTERHUB_FILES:
      let resourceLocalFilesBeingFetched = new Set(Array.from(state.resourceLocalFilesBeingFetched));
      resourceLocalFilesBeingFetched.add(action.payload.resourceId);
      return {
        ...state,
        resourceLocalFilesBeingFetched,
      };
    case ResourcesActions.SET_ARCHIVE_MESSAGE:
      let archiveMessage = action.payload
      return {
        ... state,
        archiveMessage,
      }
    default:
      return state;
  }
}

function recursivelyConvertDatesToMoment(files: (IFile | IFolder)[]) {
  return files.map(fileOrFolder => {
    if (fileOrFolder.lastModified) {
      fileOrFolder.lastModified = moment(fileOrFolder.lastModified);
    }
    return fileOrFolder;
  });
}

export function userDataReducer(state: IUserState = initUserState, action: UserActionTypes): IUserState {
  switch (action.type) {
    case UserInfoActions.NOTIFY_ATTEMPTING_HYDROSHARE_LOGIN:
      return {...state, attemptingLogin: true};
    case UserInfoActions.NOTIFY_HYDROSHARE_AUTHENTICATION_FAILED:
      return {...state, authenticationFailed: true};
    case UserInfoActions.NOTIFY_RECEIVED_HYDROSHARE_LOGIN_RESPONSE:
      return {
        ...state,
        attemptingLogin: false,
        authenticationFailed: !action.payload.loginSuccess,
        credentialsInvalid: !action.payload.loginSuccess,
      };
    case UserInfoActions.SET_USER_INFO:
      return {...state, userInfo: action.payload};
    default:
      return state;
  }
}
