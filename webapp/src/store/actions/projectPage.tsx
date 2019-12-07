import { action } from 'typesafe-actions';
import { ProjectDetailsPageActions, ProjectsActions } from '../actions/action-names';
import { SortByOptions, ICreateNewResource, } from '../types'

export function searchBy(searchTerm: string) {
    return action(ProjectDetailsPageActions.SEARCH_BY, searchTerm);
  }

export function sortBy(sortTerm: SortByOptions) {
    return action(ProjectDetailsPageActions.SORT_BY_NAME, sortTerm);
}
  
export function createNewResource(newResource: ICreateNewResource) {
  console.log(newResource)
  return action(ProjectsActions.NEW_PROJECT, newResource);
}

