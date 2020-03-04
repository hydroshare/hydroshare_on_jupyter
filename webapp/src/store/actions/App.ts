import { push } from 'connected-react-router';
import { AnyAction } from "redux";
import {
  ThunkAction,
  ThunkDispatch,
} from "redux-thunk";

import {
  getResources,
  getUserInfo,
} from '../async-actions';
import {
  IJupyterResource,
} from '../types';

export function loadInitData(): ThunkAction<Promise<void>, {}, {}, AnyAction> {
  return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
    dispatch(getResources());
    dispatch(getUserInfo());
  };
}

export function viewResource(resource: IJupyterResource) {
  return push('/resources/' + resource.id);
}
