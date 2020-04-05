import { action } from 'typesafe-actions';
import {
    ResourcesActions,
} from './action-names';
import {
    ICreateResourceRequest,
    IFile,
    IFolder,
    IJupyterResource,
    IRootState,
} from '../types';
import { AnyAction } from 'redux';
import {
    ThunkDispatch,
} from "redux-thunk";

export function openFileInJupyterHub(jupyterResource: IJupyterResource, file: IFile | IFolder) {
    return async (dispatch: ThunkDispatch<{}, {}, AnyAction>, getState: () => IRootState) => {
        const state = getState();
        if (state.user) {
            const userName = state.user.username;
            const resourceId = jupyterResource.id;
            const filePath = `${file.name}.${file.type}`;
            const url = `https://jupyter.cuahsi.org/user/${userName}/notebooks/notebooks/data/${resourceId}/${resourceId}/data/contents/${filePath}`;
            window.open(url, '_blank');
        }
    };
}

export function createNewResource(newResource: ICreateResourceRequest) {
  return action(ResourcesActions.NEW_RESOURCE, newResource);
}
