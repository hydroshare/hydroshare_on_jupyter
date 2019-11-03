import { DemoActions, demoConstants,  FilterActions, filterConstants, IDemoState, IFilterState } from './types';

const init: IDemoState = {
  list: [],
  loading: false
};

export function demoReducer(state: IDemoState = init, action: DemoActions): IDemoState {
  switch (action.type) {
    case demoConstants.ADD_ITEM:
      return {...state, list: [...state.list, action.payload.item]};
    case demoConstants.SET_LOADING:
      return {...state, ...action.payload};
    default:
      return state;
  }
}

const initFilter: IFilterState ={
  selectAll: false,
  sortBy: 'Name'
}

export function filterReducer(state: IFilterState = initFilter, action: FilterActions): IFilterState {
  switch (action.type) {
    case filterConstants.SELECT_ALL:
      return {...state, selectAll: !state.selectAll};
    default:
      return state;
  }
}