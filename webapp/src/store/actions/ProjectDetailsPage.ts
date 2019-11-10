import { action } from 'typesafe-actions';
import { FilterBarActions } from './action-names';
import {
    IFileOrFolder,
} from '../types';

export function toggleAllSelected() {
    return action(FilterBarActions.TOGGLE_SELECT_STATUS_ALL);
}

export function toggleFileOrFolderSelected(fileOrFolder: IFileOrFolder) {
    return action(FilterBarActions.TOGGLE_SELECT_STATUS_ONE, fileOrFolder);
}
