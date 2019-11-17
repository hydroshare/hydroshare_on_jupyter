import * as React from 'react';

import {
  AllActionTypes,
  IFileOrFolder,
  SortByOptions,
} from '../store/types';
import '../styles/css/FileList.css';

import { FaRegFolder, FaFileCsv, FaFileCode} from "react-icons/fa";

import MaterialTable from 'material-table';

const HUMAN_READABLE_FILE_SIZES = [
  'B',
  'KB',
  'MB',
  'GB',
  'TB',
  'YB',
];

interface IPropsInterface {
  allSelected: boolean
  files: IFileOrFolder[]
  onFileOrFolderSelected: (arg0: IFileOrFolder, arg1: boolean) => AllActionTypes
  selectedFilesAndFolders: Set<string>
  sortBy: SortByOptions | undefined,
  searchTerm: string
  toggleAllSelected: () => AllActionTypes
}

interface IFlatFile {
  name: string,
  size: number,
  type: string,
  dirPath: string,
  id: string,
  parentId?: string,
}

interface IStateInterface {
  data: IFlatFile[]
}

export default class FileList extends React.Component<IPropsInterface, IStateInterface> {

  constructor(props: IPropsInterface) {
    super(props)
    this.state = {
      data: this.flattenFiles(this.props.files)
    }
  }             
  
  public flattenFiles(files: IFileOrFolder[], parentID='', level=0): IFlatFile[] {
    let flatFiles: IFlatFile[] = [];
    let id = 1;
    files.forEach(fileOrFolder => {
      const idString = parentID === '' ? id.toString(): parentID + '-' + id.toString()
      const spacers = this.generateSpaces(level);
      flatFiles.push({
        name: spacers+fileOrFolder.name,
        size: fileOrFolder.size,
        type: fileOrFolder.type,
        dirPath: fileOrFolder.dirPath,
        id: idString,
        parentId: parentID !== '' ? parentID : undefined,
      })
      if (fileOrFolder.contents) {
        flatFiles = flatFiles.concat(this.flattenFiles(fileOrFolder.contents, idString, level+1))
      }
      id++;
    });
    return flatFiles;
  }

  public render() {
    const { files } = this.props;
    if (!files) {
      return null;
    }

    console.log(this.state.data)

    return (
      <MaterialTable
        title="Simple Action Preview"
        columns={[
          { title: 'Name', field: 'name', cellStyle:{ whiteSpace: 'pre'} },
          { title: 'Type', field: 'type' },
          { title: 'Size', field: 'size', type: 'numeric' },
        ]}
        data={this.state.data}      
        actions={[
          {
            icon: 'save',
            tooltip: 'Save User',
            onClick: (event, rowData) => alert("You saved " + rowData)
          }
        ]}
        parentChildData={(row, rows) => rows.find(a => a.id === row.parentId)}
        options={{
          selection: true,
          sorting: true,
          search: true,
        }}
        /*editable={{
          onRowAdd: newData =>
            new Promise((resolve, reject) => {
              setTimeout(() => {
                {
                  const data = this.state.data;
                  data.push(newData);
                  this.setState({ data }, () => resolve());
                }
                resolve()
              }, 1000)
            }),
          onRowUpdate: (newData, oldData) =>
            new Promise((resolve, reject) => {
              setTimeout(() => {
                {
                  const data = this.state.data;
                  if (oldData) {
                    const index = data.indexOf(oldData);
                    data[index] = newData;
                  }
                  this.setState({ data }, () => resolve());
                }
                resolve()
              }, 1000)
            }),
          onRowDelete: oldData =>
            new Promise((resolve, reject) => {
              setTimeout(() => {
                {
                  const data = this.state.data;
                  const index = data.indexOf(oldData);
                  data.splice(index, 1);
                  this.setState({ data }, () => resolve());
                }
                resolve()
              }, 1000)
            }),
        }}*/

      />

      /*<table className="FileList">
        <thead>
        <td className="select">
          <input
            className="select-all"
            checked={this.props.allSelected}
            onChange={this.props.toggleAllSelected}
            type="checkbox"
          />
        </td>
        <td>Name</td>
        <td>Type</td>
        <td>Size</td>
        </thead>
        <tbody>
        {this.buildDirectoryTree(files)}
        </tbody>
      </table>*/
    )
  }

  private buildDirectoryTree = (contents: IFileOrFolder[], level=0, override = false): [React.ReactElement[], boolean] => {
    switch (this.props.sortBy) {
      case SortByOptions.Name:
        contents.sort((a, b) => (a.name > b.name) ? 1 : -1)
        break;
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
        break;
      case SortByOptions.Type:
        contents.sort((a, b) => (a.type > b.type) ? 1 : -1)
        break;
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

        let fileIcon;
        switch(fileOrFolder.type) {
          case 'folder':
            fileIcon = <FaRegFolder/>
            break;
          case 'csv':
            fileIcon = <FaFileCsv/>
            break;
          case 'ipynb':
            fileIcon = <FaFileCode/>
            break;
          default:
            break;
        }

        elements.push(
          <tr>
            <td className="select"><input className="selectOne-checkbox" type="checkbox" checked={isSelected} onChange={onSelectedToggled} /></td>
            <td className="name">{spacers}{fileIcon}  {fileOrFolder.name}</td>
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

  private generateSpaces = (count: number): string => {
    let elems ='';
    for (let i = 0; i < count; ++i) {
      elems += '         ';
    }
    return elems;
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
