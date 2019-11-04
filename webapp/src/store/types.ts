import { ActionType } from 'typesafe-actions';
import * as actions from './actions';

export type DemoActions = ActionType<typeof actions>;

export interface IDemoState {
    list: string[]
    loading: boolean
}

export type FilterActions = ActionType<typeof actions>;

export interface IFilterState {
    selectAll: boolean
    sortBy: string
}

export interface IUserState {
    name: string
}

export enum demoConstants {
    ADD_ITEM = 'ADD_ITEM',
    SET_LOADING = 'SET_LOADING',
    
}

export enum filterConstants {
    SELECT_ALL = 'SELECT_ALL',
    SORT_BY_NAME = 'SORT_BY_NAME'
}

export enum WebSocketMessages {
    SET_USER_NAME = 'SET_USER_NAME'

}
