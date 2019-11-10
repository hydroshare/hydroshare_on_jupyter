import * as React from 'react';
import FilterBar from '../components/FilterBar';
import ResourceList from '../components/ResourceList';

export default class ProjectsPage extends React.Component {

  public render() {
    return (
      <div className="page projects">
        // @ts-ignore
        <FilterBar />
        <ResourceList />
      </div>
    )
  }

}
