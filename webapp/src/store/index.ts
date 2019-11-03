import { combineReducers, createStore } from 'redux';
import { demoReducer, filterReducer } from './reducer';
import { IDemoState, IFilterState } from './types';

export interface IRootState {
    demo: IDemoState
    filter: IFilterState
}

const store = createStore<IRootState, any, any, any>(
    combineReducers({
        demo: demoReducer,
        filter: filterReducer,
    }));

export default store;