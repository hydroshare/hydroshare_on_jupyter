import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import {
  FilterBarActionTypes,
  IFileOrFolder, IRootState,
} from '../store/types';

import '../styles/FileList.css';

const HUMAN_READABLE_FILE_SIZES = [
  'B',
  'KB',
  'MB',
  'GB',
  'TB',
  'YB',
];


const mapStateToProps = ({ mainPage, projects }: IRootState) => {
  if (!mainPage.openProjectId || !projects.allProjects[mainPage.openProjectId]) {
    // This will never be the case, since this component displaying is conditioned on this being false
    return null;
  }
  const project = projects.allProjects[mainPage.openProjectId];
  return {
    files: project.files,
    name: project.name,
  }
};

const mapDispatchToProps = (dispatch: Dispatch<FilterBarActionTypes>) => {
  return {

  }
};

type PropsType = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

class FileList extends React.Component<PropsType, never> {

  public render() {
    if (!this.props.name) {
      return null;
    }

    return (
      <table className="FileList">
        <thead>
        <td>Name</td>
        <td>Type</td>
        <td>Size</td>
        </thead>
        <tbody>
        {this.buildDirectoryTree(this.props.files)}
        </tbody>
      </table>
    )
  }

  private buildDirectoryTree = (contents: IFileOrFolder[], level=0): React.ReactElement[] => {
    let elements: React.ReactElement[] = [];
    contents.forEach(fileOrFolder => {
      const spacers = this.generateSpacers(level);
      elements.push(
        <tr>
          <td className="name">{spacers}{fileOrFolder.name}</td>
          <td className="type">{fileOrFolder.type}</td>
          <td className="size">{this.getFormattedSizeString(fileOrFolder.size)}</td>
        </tr>
      );
      if (fileOrFolder.contents) {
        elements = elements.concat(this.buildDirectoryTree(fileOrFolder.contents, level+1));
      }
    });
    return elements;
  };

  private generateSpacers = (count: number): React.ReactElement[] => {
    const elems: React.ReactElement[] = [];
    for (let i = 0; i < count; ++i) {
      elems.push(<span className="spacer" />);
    }
    return elems;
  };


  // TODO: Write some unit tests
  private getFormattedSizeString = (sizeBytes: number): string => {
    const logSizeBase10Point24 = Math.log(sizeBytes)/Math.log(10.24);
    const labelIndex = Math.floor(logSizeBase10Point24 / 3);
    const sizeInHumanReadableUnits = Math.round(sizeBytes / Math.pow(10.24, labelIndex * 3));
    return `${sizeInHumanReadableUnits}${HUMAN_READABLE_FILE_SIZES[labelIndex]}`;
  };

}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FileList);
