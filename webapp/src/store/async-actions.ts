import axios, { AxiosResponse } from 'axios';
import {
    AnyAction,
} from 'redux';
import {
  ThunkAction,
  ThunkDispatch,
} from 'redux-thunk';

import {
    setUserInfo,
} from './actions/user';
import {
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
