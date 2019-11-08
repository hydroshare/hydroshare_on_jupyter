import { push } from 'connected-react-router';

import {
  IJupyterProject,
} from '../types';

export function viewProject(project: IJupyterProject) {
  return push('/projects/' + project.id);
}
