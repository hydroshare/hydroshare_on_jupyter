import { AnyAction } from 'redux';
import {
  ThunkDispatch,
} from "redux-thunk";
import { action } from 'typesafe-actions';

import {
  MainPageActions,
} from './action-names';
import {
  IJupyterResource,
  IRootState,
  SortByOptions,
} from '../types';

export function toggleAllResourcesSelected() {
    return async (dispatch: ThunkDispatch<{}, {}, AnyAction>, getState: () => IRootState) => {
        const state = getState();
        let selectedResources;
        if (state.mainPage.allResourcesSelected) {
          selectedResources = new Set<string>();
        } else {
          selectedResources = new Set(Object.keys(state.resources.allResources));
        }
        dispatch(action(MainPageActions.SET_SELECTED_RESOURCES, {
          allResourcesSelected: !state.mainPage.allResourcesSelected,
          selectedResources,
        }));
    };
}

export function toggleSingleResourceSelected(resource: IJupyterResource) {
    return async (dispatch: ThunkDispatch<{}, {}, AnyAction>, getState: () => IRootState) => {
        const state = getState();
        const { allResources } = state.resources;
        let selectedResources = new Set(state.mainPage.selectedResources);
        if (selectedResources.has(resource.id)) {
          selectedResources.delete(resource.id);
        } else {
          selectedResources.add(resource.id);
        }
        dispatch(action(MainPageActions.SET_SELECTED_RESOURCES, {
          allResourcesSelected: selectedResources.size === Object.keys(allResources).length,
          selectedResources,
        }));
    };
}

export function setTableSortBy(sortBy: SortByOptions) {
    return action(MainPageActions.SET_TABLE_SORT_BY, sortBy);
}
