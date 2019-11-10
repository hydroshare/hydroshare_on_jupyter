import { action } from 'typesafe-actions';
import { ProjectDetailsPageActions } from './action-names';
import {
    IFileOrFolder,
    IJupyterProject,
} from '../types';

export function toggleIsSelectedAll(project: IJupyterProject) {
    return action(ProjectDetailsPageActions.TOGGLE_IS_SELECTED_ALL, project);
}

export function toggleIsSelectedOne(fileOrFolder: IFileOrFolder) {
    return action(ProjectDetailsPageActions.TOGGLE_IS_SELECTED_ONE, fileOrFolder);
}
