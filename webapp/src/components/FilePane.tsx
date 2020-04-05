import * as React from 'react';
import { ReactElement } from 'react';
import {
  Draggable,
  DraggableStateSnapshot,
  Droppable,
  DroppableStateSnapshot,
} from 'react-beautiful-dnd';
import * as moment from 'moment';

import {
  FileOrFolderTypes,
  IFile,
  IFolder,
} from '../store/types';

interface IFilePaneState {
  allFilesAndFoldersSelected: boolean
  selectedFilesAndFolders: Set<string>
}

interface IFilePaneProps {
  className: string
  rootDir: IFolder
  droppableId: string
  filterByName?: string
  header?: ReactElement
  openFile?: (f: IFile) => any
  onSelectedFilesAndFoldersChange?: (items: Set<String>) => any
}

export default class FilePane extends React.Component<IFilePaneProps, IFilePaneState> {

  state = {
    allFilesAndFoldersSelected: false,
    selectedFilesAndFolders: new Set<string>(),
  };

  render() {
    const className = ['FilePane', 'table'];
    if (this.props.className) {
      className.push(this.props.className);
    }

    let filesAndFolders: (IFile | IFolder)[];
    if (this.props.rootDir) {
      if (this.props.filterByName) {
        filesAndFolders = this.filterFilesAndFolders(this.props.rootDir.contents, this.props.filterByName.toLowerCase());
      } else {
        filesAndFolders = this.props.rootDir.contents;
      }
    }

    return (
      <div className={className.join(' ')}>
        <div className="FilePane-header">
          {this.props.header}
        </div>
        <Droppable droppableId={this.props.droppableId}>
          {(provided, snapshot) => (
            <div
              className={this.getDroppableClasses(snapshot, 'FilePane-files-container')}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              <div className="table-header table-row">
                <span className="checkbox">
                  <input
                    checked={this.state.allFilesAndFoldersSelected}
                    onChange={this.toggleAllFilesAndFoldersSelected}
                    type="checkbox"
                  />
                </span>
                <span>Name</span>
                <span>Type</span>
                <span>Size</span>
                <span>Last Modified</span>
              </div>
              {filesAndFolders?.map((item, idx) => this.generateFileOrFolderElement(item, idx, this.props.openFile))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    );
  };

  filterFilesAndFolders = (items: (IFile | IFolder)[], filter: string): (IFile | IFolder)[] => {
    let filteredItems: (IFile | IFolder)[] = [];
    items.forEach(item => {
      // Add the file or folder if the name matches the filter
      if (item.name.toLowerCase().includes(filter)) {
        filteredItems.push(item);
      } else if (item.type === FileOrFolderTypes.FOLDER) {
        // See if any of the folder's contents match
        let contents = this.filterFilesAndFolders((item as IFolder).contents, filter);
        if (contents.length > 0) {
          // Since some of the contents match, add this folder, but only show the contents that match the filter
          let filteredFolder = {...item, contents};
          filteredItems.push(filteredFolder);
          // TODO: Expand this folder
        }
      }
    });
    return filteredItems;
  };

  generateFileOrFolderElement = (item: IFile | IFolder, index: number, openFile: ((f: IFile) => IFile) | undefined, nestLevel: number = 0) => {
    if (item.type === FileOrFolderTypes.FOLDER) {
      return this.generateFolderElement(item as IFolder, index, openFile, nestLevel);
    } else {
      return this.generateFileElement(item as IFile, index, openFile, nestLevel);
    }
  };

  generateFileElement = (file: IFile, index: number, openFile: ((f: IFile) => any) | undefined, nestLevel: number = 0) => {
    const onClick = openFile ? () => openFile(file) : undefined;
    return (
      <Draggable draggableId={file.path} index={index} key={file.path}>
        {(provided, snapshot) => (
          <div
            className={this.getDraggableClasses(snapshot, 'table-row file-element')}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            {this.generateTableCell(this.generateCheckBox(file))}
            {this.generateTableCell(file.name, nestLevel, onClick)}
            {this.generateTableCell(file.type)}
            {this.generateTableCell(this.getFormattedSizeString(file.sizeBytes))}
            {this.generateTableCell(file.lastModified || 'Unknown')}
          </div>
        )}
      </Draggable>
    );
  };

  generateFolderElement = (folder: IFolder, index: number, openFile: ((f: IFile) => any) | undefined, nestLevel: number = 0) => {
    const folderLineItem = (
      <Draggable draggableId={folder.path} index={0} key={folder.path}>
        {(provided, snapshot) => (
          <div
            className={this.getDraggableClasses(snapshot, 'table-row folder-element')}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            {this.generateTableCell(this.generateCheckBox(folder))}
            {this.generateTableCell(folder.name, nestLevel)}
            {this.generateTableCell('folder')}
            {this.generateTableCell(this.getFormattedSizeString(folder.sizeBytes))}
            {this.generateTableCell(folder.lastModified || 'Unknown')}
          </div>
        )}
      </Draggable>
    );

    const folderContentsLineItems = folder.contents?.map((item, idx) =>
      this.generateFileOrFolderElement(item, idx + 1, openFile, nestLevel + 1));

    return (
      <Droppable droppableId={folder.path} key={folder.path}>
        {(provided, snapshot) => (
          <div
            className={this.getDroppableClasses(snapshot)}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {folderLineItem}
            {folderContentsLineItems}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );
  };

  generateTableCell = (content: ReactElement | string | number | moment.Moment, nestLevel: number = 0, onClick: any = undefined) => {
    const style = {
      paddingLeft: `${nestLevel * 7}px`,
    };
    const tooltip = typeof content === 'string' ? content : undefined;
    const classNames: Array<string> = [];
    if (onClick) {
      classNames.push('clickable');
    }
    if (moment.isMoment(content)) {
      return (
        <div title={tooltip} onClick={onClick} className={classNames.join(' ')}>
          <span style={style}>{content.format('MMM D, YYYY')}</span>
        </div>
      );
    } else {
      return (
        <div title={tooltip} onClick={onClick} className={classNames.join(' ')}>
          <span style={style}>{content}</span>
        </div>
      );
    }
  };

  generateCheckBox = (item: IFile | IFolder) => {
    const onClick = () => this.toggleSingleFileOrFolderSelected(item);
    return (
      <input type="checkbox" onClick={onClick} checked={this.state.selectedFilesAndFolders.has(item.path)}/>
    );
  };

  getDroppableClasses = (snapshot: DroppableStateSnapshot, classes: string = '') => {
    if (snapshot.isDraggingOver) classes += ' draggable-over';
    return classes;
  };

  getDraggableClasses = (snapshot: DraggableStateSnapshot, classes: string = '') => {
    if (snapshot.isDragging) classes += ' dragging';
    return classes;
  };

  toggleAllFilesAndFoldersSelected = () => {
    let selectedFilesAndFolders = new Set<string>();
    if (!this.state.allFilesAndFoldersSelected) {
      this.props.rootDir.contents.forEach(item => {
        if (item.type === FileOrFolderTypes.FILE) {
          selectedFilesAndFolders.add(item.path);
        } else {
          this.setFolderSelected(selectedFilesAndFolders, item as IFolder, true);
        }
      });
    }
    this.setState({
      allFilesAndFoldersSelected: !this.state.allFilesAndFoldersSelected,
      selectedFilesAndFolders: selectedFilesAndFolders,
    });
    if (this.props.onSelectedFilesAndFoldersChange) {
      this.props.onSelectedFilesAndFoldersChange(selectedFilesAndFolders);
    }
  };

  toggleSingleFileOrFolderSelected = (item: IFile | IFolder) => {
    let selectedFilesAndFolders = new Set(this.state.selectedFilesAndFolders);
    const makeSelected = !selectedFilesAndFolders.has(item.path);
    if (makeSelected) {
      selectedFilesAndFolders.add(item.path);
    } else {
      selectedFilesAndFolders.delete(item.path);
    }
    if (item.type === FileOrFolderTypes.FOLDER) {
      this.setFolderSelected(selectedFilesAndFolders, item as IFolder, makeSelected);
    }
    this.setState({
      allFilesAndFoldersSelected: false, // TODO: Get a count of the number of files to check against
      selectedFilesAndFolders: selectedFilesAndFolders,
    });
    if (this.props.onSelectedFilesAndFoldersChange) {
      this.props.onSelectedFilesAndFoldersChange(selectedFilesAndFolders);
    }
  };

  setFolderSelected = (set: Set<string>, folder: IFolder, isSelected: boolean) => {
    if (isSelected) {
      set.add(folder.path);
    } else {
      set.delete(folder.path);
    }
    folder.contents?.forEach(item => {
      if (item.type === FileOrFolderTypes.FOLDER) {
        this.setFolderSelected(set, item as IFolder, isSelected);
      } else {
        if (isSelected) {
          set.add(item.path);
        } else {
          set.delete(item.path);
        }
      }
    });
  };

// TODO: Write some unit tests
  getFormattedSizeString = (sizeBytes: number): string => {
    if (sizeBytes === undefined || sizeBytes === null) {
      return 'Unknown';
    }
    if (sizeBytes === 0) {
      return '0B';
    }
    const log10 = Math.log10(sizeBytes);
    const labelIndex = Math.floor(log10 / 3);
    const sizeInHumanReadableUnits = Math.round(sizeBytes / Math.pow(10, log10));
    return `${sizeInHumanReadableUnits}${HUMAN_READABLE_FILE_SIZES[labelIndex]}`;
  };

}

const HUMAN_READABLE_FILE_SIZES = [
  'B',
  'KB',
  'MB',
  'GB',
  'TB',
  'YB',
];
