import * as React from 'react';

import {
  AllActionTypes,
  IFileOrFolder,
  SortByOptions,
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
  onFileOrFolderSelected: (arg0: IFileOrFolder, arg1: boolean) => AllActionTypes
  selectedFilesAndFolders: Set<string>
  searchTerm: string,
  sortBy: SortByOptions | undefined,
}

export default class FileList extends React.Component<IPropsInterface, never> {

  constructor(props: IPropsInterface) {
    super(props)
  }

  public render() {
    const { files, searchTerm } = this.props;
    if (!files) {
      return null;
    }

    console.log(searchTerm)

    return (
      <table className="FileList">
        <thead>
        <td />
        <td>Name</td>
        <td>Type</td>
        <td>Size</td>
        </thead>
        <tbody>
        {this.buildDirectoryTree(files)}
        </tbody>
      </table>
    )
  }

  private buildDirectoryTree = (contents: IFileOrFolder[], level=0, override = false): [React.ReactElement[], boolean] => {
    switch (this.props.sortBy) {
      case SortByOptions.Name:
        contents.sort((a, b) => (a.name > b.name) ? 1 : -1)
      case SortByOptions.Date:
        contents.sort((a, b) => {
          const dateA = a.lastModified ? a.lastModified : ''
          const dateB = b.lastModified ? b.lastModified : ''
    
          if (dateA < dateB) {
            return -1;
          } else if (dateA > dateB) {
              return 1;
          } else {
              return 0;
          }
        })
      case SortByOptions.Type:
        contents.sort((a, b) => (a.type > b.type) ? 1 : -1)
      default:
        break;
    }
    let elements: React.ReactElement[] = [];
    let relevantFileForSearch = false
    contents.forEach(fileOrFolder => {
      let subElements;
      let subFileForSearch;
      if (fileOrFolder.contents) {
        const returnValue = this.buildDirectoryTree(fileOrFolder.contents, level+1)
        subElements = returnValue[0]
        subFileForSearch = returnValue[1]
      }
      const searchTermPresent = fileOrFolder.name.toLowerCase().includes(this.props.searchTerm.toLowerCase())
      if (searchTermPresent || subFileForSearch || override) {
        relevantFileForSearch = true
      
        const spacers = this.generateSpacers(level);
        const itemPath = fileOrFolder.dirPath + fileOrFolder.name;
        const isSelected = this.props.selectedFilesAndFolders.has(itemPath);
        const onSelectedToggled = (e: React.ChangeEvent<HTMLInputElement>) => this.props.onFileOrFolderSelected(fileOrFolder, e.target.checked);
        elements.push(
          <tr>
            <input className="selectOne-checkbox" type="checkbox" checked={isSelected} onChange={onSelectedToggled} />
            <td className="name">{spacers}{fileOrFolder.name}</td>
            <td className="type">{fileOrFolder.type}</td>
            <td className="size">{this.getFormattedSizeString(fileOrFolder.size)}</td>
          </tr>
        );
        if (fileOrFolder.contents) {
          if (searchTermPresent || override) {
            elements = elements.concat(this.buildDirectoryTree(fileOrFolder.contents, level+1, true)[0]);
          } else if (subFileForSearch && subElements) {
            elements = elements.concat(subElements)
          }
        }
      }
    });
    return [elements, relevantFileForSearch];
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
