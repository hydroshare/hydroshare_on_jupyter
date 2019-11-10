import { action } from 'typesafe-actions';
import { FilterBarActions } from '../actions/action-names';

export function searchProjectBy(searchTerm: string) {
    return action(FilterBarActions.SEARCH_PROJECT_BY, searchTerm);
  }