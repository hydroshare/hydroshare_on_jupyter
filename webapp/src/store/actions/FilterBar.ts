import { action } from 'typesafe-actions';
import {
  FilterBarActions,
} from './action-names';

export function selectAll() {
  return action(FilterBarActions.SELECT_ALL);
}
