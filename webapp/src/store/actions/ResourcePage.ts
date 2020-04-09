import {
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
            // TODO: Remove this hardcoded value
            const url = `https://jupyter.cuahsi.org/user/${userName}/notebooks/notebooks/data/${resourceId}/${resourceId}/data/contents/${filePath}`;
            window.open(url, '_blank');
        }
    };
}
