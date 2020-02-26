import { action } from 'typesafe-actions';
import {
    ResourcePageActions,
    ResourcesActions,
} from './action-names';
import {
    getResourceLocalFiles,
    getResourceHydroShareFiles,
} from '../async-actions';
import {
    ICreateResourceRequest,
    IFile,
    IFolder,
    IJupyterResource,
    IRootState,
    SortByOptions,
} from '../types';
import { AnyAction } from 'redux';
import {
    ThunkAction,
    ThunkDispatch,
} from "redux-thunk";

export function getFilesIfNeeded(resource: IJupyterResource): ThunkAction<Promise<void>, {}, {}, AnyAction> {
    return async (dispatch: ThunkDispatch<{}, {}, AnyAction>) => {
        if (resource && !resource.jupyterHubFiles) {
            dispatch(getResourceLocalFiles(resource.id));
        }
        if (resource && resource.hydroShareResource && !resource.hydroShareResource.files) {
            dispatch(getResourceHydroShareFiles(resource.id));
        }
    };
}

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

export function toggleIsSelectedAllLocal(resource: IJupyterResource) {
    return action(ResourcePageActions.TOGGLE_IS_SELECTED_ALL_JUPYTER, resource);
}

export function toggleIsSelectedAllHydroShare(resource: IJupyterResource) {
    return action(ResourcePageActions.TOGGLE_IS_SELECTED_ALL_HYDROSHARE, resource);
}

export function toggleIsSelectedOneLocal(fileOrFolder: IFile | IFolder) {
    return action(ResourcePageActions.TOGGLE_IS_SELECTED_ONE_JUPYTER, fileOrFolder);
}

export function toggleIsSelectedOneHydroShare(fileOrFolder: IFile | IFolder) {
    return action(ResourcePageActions.TOGGLE_IS_SELECTED_ONE_HYDROSHARE, fileOrFolder);
}

export function searchResourceBy(searchTerm: string) {
    return action(ResourcePageActions.SEARCH_RESOURCE_BY, searchTerm);
  }

export function sortBy(sortTerm: SortByOptions) {
    return action(ResourcePageActions.SORT_BY_NAME, sortTerm);
}

export function searchBy(searchTerm: string) {
    return action(ResourcePageActions.SEARCH_BY, searchTerm);
}

export function createNewResource(newResource: ICreateResourceRequest) {
  return action(ResourcesActions.NEW_RESOURCE, newResource);
}
