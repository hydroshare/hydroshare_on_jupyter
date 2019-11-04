import {
    action,
    ActionType,
} from 'typesafe-actions';

import * as userActions from './actions/user';
import { demoConstants, filterConstants } from './types';

export type UserActions = ActionType<typeof userActions>;

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
