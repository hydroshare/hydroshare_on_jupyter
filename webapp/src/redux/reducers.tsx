// This file contains a bunch of Redux reducers

export const initialState: TableState = {
  showRows: false
};

export enum ActionTypes {
  TOGGLE_ROWS = "TOGGLE_ROWS"
}

export function rootReducer(
  state: TableState = initialState,
  action: BaseAction
) {
  switch (action.type) {
    case ActionTypes.TOGGLE_ROWS:
      return { ...state, showMessage: !state.showRows };
    default:
      return state;
  }
}

export interface BaseAction {
  type: ActionTypes;
}

export default interface TableState {
  showRows: boolean;
}
