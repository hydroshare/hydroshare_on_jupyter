import { action } from 'typesafe-actions';
import { WebSocketMessages, FilterBarActions } from '../actions/action-names';

export function setUserName(item: string) {
    return action(WebSocketMessages.SET_USER_NAME, {
        item
    });
}


export function selectAll() {
    return action(FilterBarActions.SELECT_ALL);
}