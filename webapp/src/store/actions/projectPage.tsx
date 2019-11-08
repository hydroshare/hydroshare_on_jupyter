import { action } from 'typesafe-actions';
import { FilterBarActions } from '../actions/action-names';

export function searchBy(searchTerm: string) {
    return action(FilterBarActions.SEARCH_BY, searchTerm);
  }

export function selectAll() {
    return action(FilterBarActions.SELECT_ALL);
}
  