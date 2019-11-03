import { combineReducers, createStore } from 'redux';
import { demoReducer } from './reducer';
import { IDemoState } from './types';

export interface IRootState {
    demo: IDemoState
}

const store = createStore<IRootState, any, any, any>(
    combineReducers({
        demo: demoReducer
    }));

export default store;