import { action } from 'typesafe-actions';
import { ProjectDetailsPageActions } from '../actions/action-names';
import { SortByOptions } from '../types'

export function searchBy(searchTerm: string) {
    return action(ProjectDetailsPageActions.SEARCH_BY, searchTerm);
  }

export function sortBy(sortTerm: SortByOptions) {
    return action(ProjectDetailsPageActions.SORT_BY_NAME, sortTerm);
}
  