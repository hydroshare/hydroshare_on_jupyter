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
  IUserInfo,
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

export function userDataReducer(state: IUserInfo, action: UserActionTypes): IUserInfo | null {
  switch (action.type) {
    case UserInfoActions.SET_USER_INFO:
      return {...state, ...action.payload};
    default:
      if (state === undefined) {
        return null;
      }
      return state;
  }
}
