import * as React from 'react';

import {
  IFileOrFolder,
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

interface IPropsInterface {
  files: IFileOrFolder[]
}

export default class FileList extends React.Component<IPropsInterface, never> {

  public render() {
    if (!this.props.files) {
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
