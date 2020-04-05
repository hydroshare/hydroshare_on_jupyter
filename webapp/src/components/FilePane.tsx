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

interface IFilePaneProps {
  className: string
  rootDir: IFolder
  droppableId: string
  filterByName?: string
  header?: ReactElement
  openFile?: (f: IFile) => any
}

const FilePane: React.FC<IFilePaneProps> = (props: IFilePaneProps) => {

  const onAllFilesCheckboxToggled = () => console.log("Checked!");

  const className = ['FilePane', 'table'];
  if (props.className) {
    className.push(props.className);
  }

  let filesAndFolders: (IFile | IFolder)[];
  if (props.rootDir) {
    if (props.filterByName) {
      filesAndFolders = filterFilesAndFolders(props.rootDir.contents, new RegExp(props.filterByName, 'i'));
    } else {
      filesAndFolders = props.rootDir.contents;
    }
  }

  return (
    <div className={className.join(' ')}>
      <div className="FilePane-header">
        {props.header}
      </div>
      <Droppable droppableId={props.droppableId}>
        {(provided, snapshot) => (
          <div
            className={getDroppableClasses(snapshot, 'FilePane-files-container')}
            ref={provided.innerRef}
            {...provided.droppableProps}
            >
            <div className="table-header table-row">
              <span className="checkbox">
                <input type="checkbox" onChange={onAllFilesCheckboxToggled} />
              </span>
              <span>Name</span>
              <span>Type</span>
              <span>Size</span>
              <span>Last Modified</span>
            </div>
            {filesAndFolders?.map((item, idx) => generateFileOrFolderElement(item, idx, props.openFile))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

const filterFilesAndFolders = (items: (IFile | IFolder)[], filter: RegExp): (IFile | IFolder)[] => {
  let filteredItems: (IFile | IFolder)[] = [];
  items.forEach(item => {
    // Add the file or folder if the name matches the filter
    if (filter.exec(item.name)) {
      filteredItems.push(item);
    } else if (item.type === FileOrFolderTypes.FOLDER) {
      // See if any of the folder's contents match
      let contents = filterFilesAndFolders((item as IFolder).contents, filter);
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

const generateFileOrFolderElement = (item: IFile | IFolder, index: number, openFile: ((f: IFile) => IFile) | undefined, nestLevel: number = 0) => {
  if (item.type === FileOrFolderTypes.FOLDER) {
    return generateFolderElement(item as IFolder, index, openFile, nestLevel);
  } else {
    return generateFileElement(item as IFile, index, openFile, nestLevel);
  }
};

const generateFileElement = (item: IFile, index: number, openFile: ((f: IFile) => any) | undefined, nestLevel: number = 0) => {
  const onClick = openFile ? () => openFile(item) : undefined;
  return (
    <Draggable draggableId={item.path} index={index} key={item.path}>
      {(provided, snapshot) => (
        <div
          className={getDraggableClasses(snapshot, 'table-row file-element')}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {generateTableCell(generateCheckBox())}
          {generateTableCell(item.name, nestLevel, onClick)}
          {generateTableCell(item.type)}
          {generateTableCell(getFormattedSizeString(item.sizeBytes))}
          {generateTableCell(item.lastModified || 'Unknown')}
        </div>
      )}
    </Draggable>
  );
};

const generateFolderElement = (folder: IFolder, index: number, openFile: ((f: IFile) => any) | undefined, nestLevel: number = 0) => {
  const folderLineItem = (
    <Draggable draggableId={folder.path} index={0} key={folder.path}>
        {(provided, snapshot) => (
          <div
            className={getDraggableClasses(snapshot, 'table-row folder-element')}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            {generateTableCell(generateCheckBox())}
            {generateTableCell(folder.name, nestLevel)}
            {generateTableCell('folder')}
            {generateTableCell(getFormattedSizeString(folder.sizeBytes))}
            {generateTableCell(folder.lastModified || 'Unknown')}
          </div>
        )}
      </Draggable>
  );

  const folderContentsLineItems = folder.contents?.map((item, idx) =>
    generateFileOrFolderElement(item, idx+1, openFile,nestLevel+1));

  return (
    <Droppable droppableId={folder.path} key={folder.path}>
      {(provided, snapshot) => (
      <div
        className={getDroppableClasses(snapshot)}
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

const generateTableCell = (content: ReactElement | string | number | moment.Moment, nestLevel: number = 0, onClick: any = undefined) => {
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

const generateCheckBox = () => {
  return (
    <input type="checkbox" />
  );
};

const getDroppableClasses = (snapshot: DroppableStateSnapshot, classes: string = '') => {
  if (snapshot.isDraggingOver) classes += ' draggable-over';
  return classes;
};

const getDraggableClasses = (snapshot: DraggableStateSnapshot, classes: string = '') => {
  if (snapshot.isDragging) classes += ' dragging';
  return classes;
};

const HUMAN_READABLE_FILE_SIZES = [
  'B',
  'KB',
  'MB',
  'GB',
  'TB',
  'YB',
];

// TODO: Write some unit tests
const getFormattedSizeString = (sizeBytes: number): string => {
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

export default FilePane;
