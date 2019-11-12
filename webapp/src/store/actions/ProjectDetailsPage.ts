import { action } from 'typesafe-actions';
import { ProjectDetailsPageActions } from './action-names';
import {
    IFileOrFolder,
    IJupyterProject,
    SortByOptions,
} from '../types';

export function toggleIsSelectedAll(project: IJupyterProject) {
    return action(ProjectDetailsPageActions.TOGGLE_IS_SELECTED_ALL, project);
}

export function toggleIsSelectedOne(fileOrFolder: IFileOrFolder) {
    return action(ProjectDetailsPageActions.TOGGLE_IS_SELECTED_ONE, fileOrFolder);
}

export function searchProjectBy(searchTerm: string) {
    return action(ProjectDetailsPageActions.SEARCH_PROJECT_BY, searchTerm);
  }

export function sortBy(sortTerm: SortByOptions) {
    return action(ProjectDetailsPageActions.SORT_BY_NAME, sortTerm);
}