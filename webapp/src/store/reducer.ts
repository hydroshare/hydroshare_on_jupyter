import {
  UserActions,
} from './actions';
import {
  DemoActions,
  demoConstants,
  FilterActions,
  filterConstants,
  IDemoState,
  IFilterState,
  IUserState,
} from './types';

const init: IDemoState = {
  list: [],
  loading: false
};

const initUserState: IUserState = {
  name: '',
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

export function userReducer(state: IUserState = initUserState, action: UserActions): IUserState {
  switch (action.type) {
    // TODO: Something useful
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