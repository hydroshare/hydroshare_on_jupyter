import { action } from 'typesafe-actions';

export function setUserName(name: string) {
  // TODO: Use proper action type
  return action('NAME', name);
}
