import { action } from 'typesafe-actions';
import { demoConstants, filterConstants } from './types';

export function addItemToList(item: string) {
    return action(demoConstants.ADD_ITEM, {
        item
    });
}

export function setLoading(loading: boolean) {
    return action(demoConstants.SET_LOADING, {
        loading
    });
}

export function selectAll() {
    return action(filterConstants.SELECT_ALL);
}