import * as React from 'react';

import {
  AllActionTypes,
  IFileOrFolder,
  SortByOptions,
} from '../store/types';
import '../styles/css/FileList.css';

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
  hydroshare: boolean,
}

interface IFlatFile {
  name: string,
  size: string,
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
  }             
  
  public flattenFiles(files: IFileOrFolder[], parentID='', level=0, override=false): [IFlatFile[], boolean] {
    let flatFiles: IFlatFile[] = [];
    let id = 1;
    let relevantFileForSearch = false

    files.forEach(fileOrFolder => {
      let subElements;
      let subFileForSearch;
      const idString = parentID === '' ? id.toString(): parentID + '-' + id.toString()
      if (fileOrFolder.contents) {
        const returnValue = this.flattenFiles(fileOrFolder.contents, idString, level+1)
        subElements = returnValue[0]
        subFileForSearch = returnValue[1]
      }
      const searchTermPresent = fileOrFolder.name.toLowerCase().includes(this.props.searchTerm.toLowerCase())
      if (searchTermPresent || subFileForSearch || override) {
        let fileIcon;
        switch(fileOrFolder.type) {
          case 'folder':
            fileIcon = '📁'
            break;
          case 'csv':
            fileIcon = '📄'
            break;
          case 'ipynb':
            fileIcon = '💻'
            break;
          default:
            break;
        }
        relevantFileForSearch = true
        const spacers = this.generateSpaces(level);
        flatFiles.push({
          name: spacers+fileIcon+'  ' +fileOrFolder.name,
          size: this.getFormattedSizeString(fileOrFolder.size),
          type: fileOrFolder.type,
          dirPath: fileOrFolder.dirPath,
          id: idString,
          parentId: parentID !== '' ? parentID : undefined,
        })
        if (fileOrFolder.contents) {
          if (searchTermPresent || override) {
            flatFiles = flatFiles.concat(this.flattenFiles(fileOrFolder.contents, idString, level+1, true)[0]);
          } else if (subFileForSearch && subElements) {
            flatFiles = flatFiles.concat(subElements)
          }
        }
      }
      id++;
    });
    return [flatFiles, relevantFileForSearch];
  }

  public render() {
    const { files } = this.props;
    if (!files) {
      return null;
    }

    console.log(this.props.files)

    return (
      <MaterialTable
        title={this.props.hydroshare ? "Hydroshare files" : "JupyterHub files"}
        columns={[
          { title: 'Name', field: 'name', cellStyle:{ whiteSpace: 'pre'} },
          { title: 'Type', field: 'type' },
          { title: 'Size', field: 'size', type: 'numeric' },
        ]}
        data={this.flattenFiles(this.props.files)[0]}      
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
          search: false,
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

  private generateSpaces = (count: number): string => {
    let elems ='';
    for (let i = 0; i < count; ++i) {
      elems += '         ';
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
