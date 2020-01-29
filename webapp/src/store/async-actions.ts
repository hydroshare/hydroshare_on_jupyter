import axios, { AxiosResponse } from 'axios';
import {
    AnyAction,
} from 'redux';
import {
  ThunkAction,
  ThunkDispatch,
} from 'redux-thunk';

import {
  setProjectLocalFiles,
  setProjectHydroShareFiles,
  setProjects,
} from './actions/projects';
import {
    setUserInfo,
} from './actions/user';
import {
  IResourceFilesData,
  IResourcesData,
  IUserInfoData,
} from './types';

// TODO: Remove this hardcoding
const BACKEND_URL = '//localhost:8080';

function getFromBackend<T>(endpoint: string): Promise<AxiosResponse<T>> {
    return axios.get<T>(BACKEND_URL + endpoint);
}

export function getUserInfo(): ThunkAction<Promise<void>, {}, {}, AnyAction> {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
      try {
          const response = await getFromBackend<IUserInfoData>('/user');
          const {
              data: {
                  first_name,
                  last_name,
              }
          } = response;
          const userInfo = {
              name: first_name + ' ' + last_name,
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

      dispatch(setProjects(resources));
    };
}

export function getResourceLocalFiles(resourceId: string) {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    const response = await getFromBackend<IResourceFilesData>(`/resources/${resourceId}/local-files`);
    const {
      data: {
        files,
      },
    } = response;

    dispatch(setProjectLocalFiles(resourceId, files));
  };
}

export function getResourceHydroShareFiles(resourceId: string) {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    const response = await getFromBackend<IResourceFilesData>(`/resources/${resourceId}/hs-files`);
    const {
      data: {
        files,
      },
    } = response;

    dispatch(setProjectHydroShareFiles(resourceId, files));
  };
}
