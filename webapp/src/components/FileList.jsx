import * as React from 'react';
import '../styles/FileList.css';

export default class FileList extends React.Component {

  state  = {
    files: [
      {
        name: 'Wonderful data',
        size: 30123,
        type: 'csv',
      },
      {
        contents: [
          {
            name: 'Wonderful data',
            type: 'csv',
            size: 30123,
          },
          {
            name: 'More wonderful data',
            type: 'csv',
            size: 55243,
          },
          {
            name: 'Garbage data',
            type: 'csv',
            size: 1002,
          },
        ],
        name: 'Data',
        type: 'folder',
      },
    ],
  };

  buildDirectoryTree = (contents, level=0) => {
    let listItems = [];
    contents.forEach(fileOrFolder => {
      let spacers = this.generateSpacers(level);
      listItems.push(
        <tr>
          <td className="name">{spacers}{fileOrFolder.name}</td>
          <td className="size">{fileOrFolder.size}</td>
        </tr>
      );
      if (fileOrFolder.type === 'folder') {
        let subItems = this.buildDirectoryTree(fileOrFolder.contents, level+1);
        listItems = listItems.concat(subItems);
      }
    });
    return listItems;
  };

  generateSpacers = (count) => {
    let elems = [];
    for (let i = 0; i < count; ++i) {
      elems.push(<span className="spacer" />);
    }
    return elems;
  };

/*
  getFormattedSizeString = sizeBytes => {
    switch (Math.log10(sizeBytes)) {

    }
  }*/

  render() {
    return (
      <table className="FileList">
        <thead>
          <td>Name</td>
          <td>Size</td>
        </thead>
        <tbody>
          {this.buildDirectoryTree(this.state.files)}
        </tbody>
      </table>
    )
  }

}
