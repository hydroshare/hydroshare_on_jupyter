
import * as React from 'react';
import { ReactElement, useState } from 'react';
import {
  Draggable,
  DraggableStateSnapshot,
  Droppable,
  DroppableStateSnapshot,
} from 'react-beautiful-dnd';
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import * as moment from 'moment';

import {
  FileOrFolderTypes,
  IFile,
  IFolder,
} from '../store/types';

import '../styles/FilePane.scss';
import Loading from "./Loading";

// @ts-ignore
const DOWNLOAD_URL = (window.BACKEND_API_URL) + '/download';
const optionsCursorTrueWithMargin = {
  followCursor: true,
  shiftX: 20,
  shiftY: 0
}

interface IFilePaneState {
  allFilesAndFoldersSelected: boolean
  expandedFolders: Set<string>
  selectedFilesAndFolders: Set<string>
  sortAscending: boolean
  sortBy: SORT_BY_OPTIONS
  hovered: boolean
  hoverableId: string
}

interface IFilePaneProps {
  resourceId: string
  className: string
  rootDir: IFolder
  droppableId: string
  filterByName?: string
  header?: ReactElement
  loading?: boolean
  openFile?: (f: IFile) => any
  onSelectedFilesAndFoldersChange?: (items: Set<String>) => any
  promptRenameFile: (fileOrFolder: IFile | IFolder) => any
  fileLocation: string
}


/**
 * Component that displays the list of files in a resource
 */
export default class FilePane extends React.Component<IFilePaneProps, IFilePaneState> {

  state = {
    allFilesAndFoldersSelected: false,
    expandedFolders: new Set<string>(),
    selectedFilesAndFolders: new Set<string>(),
    sortAscending: true,
    sortBy: SORT_BY_OPTIONS.NAME,
    hovered: false,
    hoverableId: ''
  };

  render() {

    const className = ['FilePane', 'table'];
    if (this.props.className) {
      className.push(this.props.className);
    }

    if (this.props.loading) {
      return (
        <div className={className.join(' ')}>
          <div className="FilePane-header">
            {this.props.header}
          </div>
          <Loading />
        </div>
      )
    }

    let filesAndFolders: (IFile | IFolder)[] | undefined = undefined;
    if (this.props.rootDir) {
      if (this.props.filterByName) {
        filesAndFolders = this.filterFilesAndFolders(this.props.rootDir.contents, this.props.filterByName.toLowerCase());
      } else {
        filesAndFolders = this.props.rootDir.contents;
      }
      filesAndFolders = this.getFolderContentsSorted(filesAndFolders);
    }

    const sortOrder = this.state.sortAscending ? 'sort-ascending' : 'sort-descending';

    let content: React.ReactNode;
    if (filesAndFolders && filesAndFolders.length > 0) {
      content = filesAndFolders?.map((item, idx) => this.generateFileOrFolderElement(item, idx, this.props.openFile));
    } else {
      content = (
        <div className="no-results">
          No files
        </div>
      )
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
                <button
                  className={'clickable ' + (this.state.sortBy === SORT_BY_OPTIONS.NAME ? sortOrder : '')}
                  onClick={() => this.setSortBy(SORT_BY_OPTIONS.NAME)}>
                  Name
                  {this.state.sortBy === SORT_BY_OPTIONS.NAME && SortTriangleSVG}
                </button>
                <button
                  className={'clickable ' + (this.state.sortBy === SORT_BY_OPTIONS.TYPE ? sortOrder : '')}
                  onClick={() => this.setSortBy(SORT_BY_OPTIONS.TYPE)}>
                  Type
                  {this.state.sortBy === SORT_BY_OPTIONS.TYPE && SortTriangleSVG}
                </button>
                <button
                  className={'clickable ' + (this.state.sortBy === SORT_BY_OPTIONS.SIZE ? sortOrder : '')}
                  onClick={() => this.setSortBy(SORT_BY_OPTIONS.SIZE)}>
                  Size
                  {this.state.sortBy === SORT_BY_OPTIONS.SIZE && SortTriangleSVG}
                </button>
                <button
                  className={'clickable ' + (this.state.sortBy === SORT_BY_OPTIONS.SIZE ? sortOrder : '')}
                  onClick={() => this.setSortBy(SORT_BY_OPTIONS.SIZE)}>
                  Latest In
                  {this.state.sortBy === SORT_BY_OPTIONS.SIZE && SortTriangleSVG}
                </button>
              </div>
              <div className="scrollable-container">
                {content}
                {provided.placeholder}
              </div>
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
          let filteredFolder = { ...item, contents };
          filteredItems.push(filteredFolder);
          // TODO: Expand this folder (https://github.com/hydroshare/hydroshare_jupyter_sync/issues/46)
        }
      }
    });
    return filteredItems;
  };

  handleMenuClick = (item: IFile | IFolder, action: CONTEXT_MENU_ACTIONS) => {
    switch (action) {
      case (CONTEXT_MENU_ACTIONS.RENAME):
        this.props.promptRenameFile(item);
        break;
      case (CONTEXT_MENU_ACTIONS.DOWNLOAD):
        const itemPath = item.path.split(":")[1];
        window.open(DOWNLOAD_URL + "/" + this.props.resourceId + "/" + this.props.resourceId + "/data/contents" + itemPath)

    }
  }

  // TODO: Add copy file option to context menu (https://github.com/hydroshare/hydroshare_jupyter_sync/issues/42)
  generateFileOrFolderElement = (item: IFile | IFolder, index: number, openFile: ((f: IFile) => IFile) | undefined, nestLevel: number = 0) => {
    if (item.type === FileOrFolderTypes.FOLDER) {
      return (<div>
        <ContextMenuTrigger id={item.path}>{this.generateFolderElement(item as IFolder, index, openFile, nestLevel)}</ContextMenuTrigger>
        <ContextMenu className="context-menu" id={item.path}>
          <MenuItem className="menu-item clickable" data={{ action: CONTEXT_MENU_ACTIONS.RENAME }} onClick={() => this.handleMenuClick(item, CONTEXT_MENU_ACTIONS.RENAME)}>
            Rename
            </MenuItem>
        </ContextMenu>
      </div>);
    } else {
      return (
        <div>
          <ContextMenuTrigger id={item.path}>{this.generateFileElement(item as IFile, index, openFile, nestLevel)}</ContextMenuTrigger>
          <ContextMenu className="context-menu" id={item.path}>
            <MenuItem className="menu-item clickable" data={{ action: CONTEXT_MENU_ACTIONS.RENAME }} onClick={() => this.handleMenuClick(item, CONTEXT_MENU_ACTIONS.RENAME)}>
              Rename
            </MenuItem>
            {this.props.fileLocation === "Workspace" ? <MenuItem className="menu-item clickable" data={{ action: CONTEXT_MENU_ACTIONS.DOWNLOAD }} onClick={() => this.handleMenuClick(item, CONTEXT_MENU_ACTIONS.DOWNLOAD)}>
              Download
            </MenuItem> : null}
          </ContextMenu>
        </div>);
    }
  };

  onHover = (id: any) => {
    this.setState({ hoverableId: id })
  };
  onOut = () => {
    this.setState({ hoverableId: '' })
  };
  generateFileElement = (file: IFile, index: number, openFile: ((f: IFile) => any) | undefined, nestLevel: number = 0) => {

    {
      this.state.hoverableId == file.path && (
        <div style={{ color: "red" }} id="hoverableId">
          Last Modified : {file.modifiedTime?.toString()}

        </div>
      )
    }

    const onClick = openFile ? () => openFile(file) : undefined;
    return (
      <Draggable draggableId={file.path} index={index} key={file.path} >
        {(provided, snapshot) => (
          <div
            className={this.getDraggableClasses(snapshot, 'table-row file-element')}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onMouseEnter={() => this.onHover(file.path)}
            onMouseLeave={() => this.onOut()}
          >
            {this.generateTableCell(this.generateCheckBox(file),file.modifiedTime)}
            {this.generateTableCell(file.name,file.modifiedTime, nestLevel, onClick)}
            {this.generateTableCell(file.type || 'file',file.modifiedTime)}
            {this.generateTableCell(this.getFormattedSizeString(file.sizeBytes),file.modifiedTime)}
            {this.generateTableCell(file.fileChanged|| 'Synced',file.modifiedTime)}
          </div>
        )}
      </Draggable>
    );
  }

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
            {this.generateTableCell(this.generateCheckBox(folder),folder.modifiedTime)}
            {this.generateFolderNameTableCell(folder, nestLevel)}
            {this.generateTableCell('folder',folder.modifiedTime)}
            {this.generateTableCell(this.getFormattedSizeString(folder.sizeBytes),folder.modifiedTime)}
          </div>
        )}
      </Draggable>
    );

    let folderContentsLineItems: ReactElement[];
    if (folder.contents /*&& this.state.expandedFolders.has(folder.path)*/) {
      let contents = [...folder.contents];
      folderContentsLineItems = this.getFolderContentsSorted(contents).map((item, idx) =>
        this.generateFileOrFolderElement(item, idx + 1, openFile, nestLevel + 1));
    }

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

  generateTableCell = (content: ReactElement | string | number | moment.Moment, appendToolTip: moment.Moment | undefined, nestLevel: number = 0, onClick: any = undefined) => {
    const style = {
      paddingLeft: `${nestLevel * 10}px`,
    };
    const time = appendToolTip ===undefined ? " ":appendToolTip.toString();
    const tooltip = typeof content === 'string' ? content+", Modified Time: "+time : undefined;
    const classNames: Array<string> = [];
    if (onClick) {
      classNames.push('clickable');
    }
    const text = moment.isMoment(content) ? content.format('MMM D, YYYY') : content;
    return (
      <div title={tooltip} onClick={onClick} className={classNames.join(' ')}>
        <span style={style}>{text}</span>
      </div>
    );
  };

  generateFolderNameTableCell = (folder: IFolder, nestLevel: number = 0) => {
    const style = {
      paddingLeft: `${nestLevel * 7}px`,
    };
    const tooltip = folder.name;
    const classNames = 'clickable ' + /*(this.state.expandedFolders.has(folder.path) ?*/ 'expanded' /*: 'collapsed')*/;
    const onClick = () => this.toggleFolderExpanded(folder);
    return (
      <div title={tooltip} onClick={onClick} className={classNames}>
        <span style={style}>
          <div className="icon-container">
            {SortTriangleSVG}
          </div>
          {folder.name}
        </span>
      </div>
    );
  };

  generateCheckBox = (item: IFile | IFolder) => {
    const onClick = () => this.toggleSingleFileOrFolderSelected(item);
    return (
      <input type="checkbox" onClick={onClick} checked={this.state.selectedFilesAndFolders.has(item.path)} />
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

  getFolderContentsSorted = (items: (IFile | IFolder)[]) => items.sort((i1, i2) => {
    const {
      sortAscending,
      sortBy,
    } = this.state;
    switch (sortBy) {
      case SORT_BY_OPTIONS.NAME:
        if (sortAscending) {
          return this.getItemNameForSort(i1).localeCompare(this.getItemNameForSort(i2));
        } else {
          return this.getItemNameForSort(i2).localeCompare(this.getItemNameForSort(i1));
        }
      case SORT_BY_OPTIONS.TYPE:
        if (sortAscending) {
          return (i1.type || '').localeCompare(i2.type || '');
        } else {
          return (i2.type || '').localeCompare(i1.type || '');
        }
      case SORT_BY_OPTIONS.LAST_MODIFIED:
        if (!i1.modifiedTime && !i2.modifiedTime) {
          // Neither have a defined last modified time, so consider them equal
          return 0;
        }
        if (!i1.modifiedTime) {
          // Put i1 second if ascending, i2 if descending
          return sortAscending ? -1 : 1;
        }
        if (!i2.modifiedTime) {
          // Put i2 second if ascending, i1 if descending
          return sortAscending ? 1 : -1;
        }
        if (sortAscending) {
          return i1.modifiedTime?.diff(i2.modifiedTime)
        } else {
          return i2.modifiedTime?.diff(i1.modifiedTime)
        }
      case SORT_BY_OPTIONS.SIZE:
        return (sortAscending ? 1 : -1) * ((i1.sizeBytes || -1) - (i2.sizeBytes || -1));
      default: // Should never happen, but needed to satisfy TypeScript
        return 0;
    }
  });

  getItemNameForSort = (item: IFile | IFolder): string => {
    if (item.type === FileOrFolderTypes.FOLDER) {
      return item.name;
    }
    const file = item as IFile;
    return file.type ? `${file.name}.${file.type}` : file.name;
  };

  setSortBy = (sortBy: SORT_BY_OPTIONS) => {
    if (this.state.sortBy === sortBy) {
      // Already sorted by this column, so reverse sort order
      this.setState({ sortAscending: !this.state.sortAscending });
    } else {
      // Otherwise sort by this column
      this.setState({ sortBy });
    }
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

  toggleFolderExpanded = (folder: IFolder) => {
    let expandedFolders = new Set(this.state.expandedFolders);
    if (expandedFolders.has(folder.path)) {
      expandedFolders.delete(folder.path);
    } else {
      expandedFolders.add(folder.path);
    }
    this.setState({ expandedFolders });
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
      allFilesAndFoldersSelected: false,
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

  getFormattedSizeString = (sizeBytes: number): string => {
    if (sizeBytes === undefined || sizeBytes === null) {
      return 'Unknown';
    }
    if (sizeBytes === 0) {
      return '0B';
    }
    const labelIndex = Math.floor(Math.log10(sizeBytes) / 3);
    const sizeInHumanReadableUnits = Math.round(sizeBytes / Math.pow(10, 3 * labelIndex));
    return `${sizeInHumanReadableUnits}${HUMAN_READABLE_FILE_SIZES[labelIndex]}`;
  };

}

enum SORT_BY_OPTIONS {
  NAME,
  TYPE,
  SIZE,
  LAST_MODIFIED,
}

enum CONTEXT_MENU_ACTIONS {
  RENAME,
  DOWNLOAD,
  DELETE,
}

const HUMAN_READABLE_FILE_SIZES = [
  'B',
  'KB',
  'MB',
  'GB',
  'TB',
  'YB',
];

export const SortTriangleSVG = <svg xmlns="http://www.w3.org/2000/svg" className="triangle" width="10" height="10" viewBox="0 0 2.646 2.646">
  <path d="M0 0l1.323 2.646L2.646 0z" />
</svg>;
