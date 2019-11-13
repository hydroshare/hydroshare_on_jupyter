import { action } from 'typesafe-actions';
import { ProjectDetailsPageActions } from './action-names';
import {
    IFileOrFolder,
    IJupyterProject,
    SortByOptions,
} from '../types';

export function toggleIsSelectedAllLocal(project: IJupyterProject) {
    return action(ProjectDetailsPageActions.TOGGLE_IS_SELECTED_ALL_JUPYTER, project);
}

export function toggleIsSelectedAllHydroShare(project: IJupyterProject) {
    return action(ProjectDetailsPageActions.TOGGLE_IS_SELECTED_ALL_HYDROSHARE, project);
}

export function toggleIsSelectedOneLocal(fileOrFolder: IFileOrFolder) {
    return action(ProjectDetailsPageActions.TOGGLE_IS_SELECTED_ONE_JUPYTER, fileOrFolder);
}

export function toggleIsSelectedOneHydroShare(fileOrFolder: IFileOrFolder) {
    return action(ProjectDetailsPageActions.TOGGLE_IS_SELECTED_ONE_HYDROSHARE, fileOrFolder);
}

export function searchProjectBy(searchTerm: string) {
    return action(ProjectDetailsPageActions.SEARCH_PROJECT_BY, searchTerm);
  }

export function sortBy(sortTerm: SortByOptions) {
    return action(ProjectDetailsPageActions.SORT_BY_NAME, sortTerm);
}