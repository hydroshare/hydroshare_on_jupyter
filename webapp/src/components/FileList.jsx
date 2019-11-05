import * as React from 'react';
import '../styles/FileList.css';

const HUMAN_READABLE_FILE_SIZES = [
  'B',
  'KB',
  'MB',
  'GB',
  'TB',
  'YB',
];

export default class FileList extends React.Component {

  state  = {
    files: [
      {
        name: 'My glorious notebook',
        size: 73949942858,
        type: 'ipynb',
      },
      {
        contents: [
          {
            name: 'Wonderful data',
            type: 'csv',
            size: 30124234233,
          },
          {
            name: 'More wonderful data',
            type: 'csv',
            size: 552434233,
          },
          {
            name: 'Garbage data',
            type: 'csv',
            size: 10029939402,
          },
          {
            name: 'Old data',
            type: 'folder',
            contents: [
              {
                name: 'Stubby',
                type: 'csv',
                size: 29934423,
              },
            ],
          },
        ],
        name: 'Data',
        type: 'folder',
      },
    ],
  };

  buildDirectoryTree = (contents, level=0) => {
    let elements = [];
    let directoryContentsSize = 0;
    contents.forEach(fileOrFolder => {
      let subElements;
      let itemSize;
      if (fileOrFolder.type === 'folder') {
        let children = this.buildDirectoryTree(fileOrFolder.contents, level+1);
        itemSize = children.size;
        subElements = children.elements;
      } else {
        itemSize = fileOrFolder.size;
      }
      directoryContentsSize += itemSize;
      let spacers = this.generateSpacers(level);
      elements.push(
        <tr>
          <td className="name">{spacers}{fileOrFolder.name}</td>
          <td className="type">{fileOrFolder.type}</td>
          <td className="size">{this.getFormattedSizeString(itemSize)}</td>
        </tr>
      );
      if (subElements) {
        elements = elements.concat(subElements);
      }
    });
    return {
      elements,
      size: directoryContentsSize,
    };
  };

  generateSpacers = (count) => {
    let elems = [];
    for (let i = 0; i < count; ++i) {
      elems.push(<span className="spacer" />);
    }
    return elems;
  };


  // TODO: Write some unit tests
  getFormattedSizeString = sizeBytes => {
    let logSizeBase10Point24 = Math.log(sizeBytes)/Math.log(10.24);
    let labelIndex = Math.floor(logSizeBase10Point24 / 3);
    let sizeInHumanReadableUnits = Math.round(sizeBytes / Math.pow(10.24, labelIndex * 3));
    return `${sizeInHumanReadableUnits}${HUMAN_READABLE_FILE_SIZES[labelIndex]}`;
  };

  render() {
    return (
      <table className="FileList">
        <thead>
          <td>Name</td>
          <td>Type</td>
          <td>Size</td>
        </thead>
        <tbody>
          {this.buildDirectoryTree(this.state.files).elements}
        </tbody>
      </table>
    )
  }

}
