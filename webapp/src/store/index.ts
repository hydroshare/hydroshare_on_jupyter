import { combineReducers, createStore } from 'redux';
import { demoReducer } from './redux/reducer';
import { IDemoState } from './redux/types';

export interface IRootState {
    demo: IDemoState
}

const store = createStore<IRootState, any, any, any>(
    combineReducers({
        demo: demoReducer
    }));

export default store;