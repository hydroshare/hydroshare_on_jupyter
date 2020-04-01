/**
 * This is a test of the react-beautiful-dnd package. It should be restructured significantly if it is to be used.
 * Tutorial illustrating how to customize appearing during a drag:
 * https://egghead.io/lessons/react-customise-the-appearance-of-an-app-during-a-drag-using-react-beautiful-dnd-snapshot-values
 */

import * as React from 'react';
import { ReactElement } from 'react';
import {
  DragDropContext,
  Draggable,
  DraggableStateSnapshot,
  Droppable,
  DroppableStateSnapshot,
  DropResult,
} from 'react-beautiful-dnd';
import * as moment from "moment";

import '../styles/FileManager.scss';

import {
  FileOrFolderTypes,
  IFile,
  IFolder,
} from "../store/types";

interface IFileManagerProps {
  hydroShareResourceRootDir: IFolder
  jupyterHubResourceRootDir: IFolder
  copyFileOrFolder: (src: IFile, dest: IFolder) => any
  moveFileOrFolder: (src: IFile, dest: IFolder) => any
  openFile: (file: IFile) => any
}

let fileOrFolderLookupTable = new Map<string, IFile | IFolder>();

const FileManager: React.FC<IFileManagerProps> = (props: IFileManagerProps) => {
  const {
    hydroShareResourceRootDir,
    jupyterHubResourceRootDir,
  } = props;

  const onDragEnd = (result: DropResult) => {
    const {
      draggableId: srcURI,
      destination: dest,
    } = result;
    if (!dest?.droppableId) {
      // Not sure when this happens, but droppableId is apparently optional
      return;
    }
    const destURI = dest.droppableId;
    const srcFileOrFolder = fileOrFolderLookupTable.get(srcURI) as IFile | IFolder;
    const destFolder = fileOrFolderLookupTable.get(destURI) as IFolder;
    const srcPrefix = srcURI.split(':')[0];
    const destPrefix = destURI.split(':')[0];
    console.log(`Received request to move ${srcURI} to ${destURI}.`);
    const srcParentFolderPathComponents = srcFileOrFolder.path.split('/');
    srcParentFolderPathComponents.pop();
    let srcParentFolderPath = srcParentFolderPathComponents.join('/');
    if (srcParentFolderPathComponents.length === 1) { // Length is 1 if parent folder is root dir
      srcParentFolderPath += '/';
    }
    if (srcParentFolderPath === destFolder.path) {
      console.log("File dropped in same location. Ignoring move request.");
      return;
    }
    if (srcPrefix === destPrefix) {
      // Move files within HydroShare or the local filesystem
      props.moveFileOrFolder(srcFileOrFolder, destFolder);
    } else {
      // Copy files between HydroShare and the local filesystem
      props.copyFileOrFolder(srcFileOrFolder, destFolder);
    }
    console.log(srcFileOrFolder);
    console.log(destFolder);
  };

  // Clear the lookup table
  fileOrFolderLookupTable.clear();

  const jupyterHubFilePane = props.jupyterHubResourceRootDir ? (
    <FilePane
      className="tile jupyterhub"
      droppableId={jupyterHubResourceRootDir.path}
      rootDir={jupyterHubResourceRootDir}
      headerImageUrl="/JupyterHub-logo.png"
      openFile={props.openFile}
      title="Local Files"
    />
  ) : null;
  const hydroShareFilePane = props.hydroShareResourceRootDir ? (
    <FilePane
      className="tile hydroshare"
      droppableId={hydroShareResourceRootDir.path}
      rootDir={hydroShareResourceRootDir}
      headerImageUrl="/HydroShare-logo.png"
      openFile={props.openFile}
      title="HydroShare Files"
    />
  ) : null;
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="FileManager content-row">
        {jupyterHubFilePane}
        {hydroShareFilePane}
      </div>
    </DragDropContext>
  );
};

interface IFilePaneProps {
  className: string
  rootDir: IFolder
  droppableId: string
  headerImageUrl: string
  openFile: (f: IFile) => any
  title: string
}

const getDroppableClasses = (snapshot: DroppableStateSnapshot, classes: string = '') => {
  if (snapshot.isDraggingOver) classes += ' draggable-over';
  return classes;
};

const getDraggableClasses = (snapshot: DraggableStateSnapshot, classes: string = '') => {
  if (snapshot.isDragging) classes += ' dragging';
  return classes;
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

const generateFolderElement = (folder: IFolder, index: number, openFile: (f: IFile) => any, nestLevel: number = 0) => {
  fileOrFolderLookupTable.set(folder.path, folder);
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

const generateFileElement = (item: IFile, index: number, openFile: (f: IFile) => any, nestLevel: number = 0) => {
  fileOrFolderLookupTable.set(item.path, item);
  const onClick = () => openFile(item);
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

const generateFileOrFolderElement = (item: IFile | IFolder, index: number, openFile: (f: IFile) => IFile, nestLevel: number = 0) => {
  if (item.type === FileOrFolderTypes.FOLDER) {
    return generateFolderElement(item as IFolder, index, openFile, nestLevel);
  } else {
    return generateFileElement(item as IFile, index, openFile, nestLevel);
  }
};

// TODO: Put in a different file?
const FilePane: React.FC<IFilePaneProps> = (props: IFilePaneProps) => {
  fileOrFolderLookupTable.set(props.rootDir.path, props.rootDir);

  const onAllFilesCheckboxToggled = () => console.log("Checked!");

  const className = ['FilePane'];
  if (props.className) {
    className.push(props.className);
  }

  return (
    <div className={className.join(' ')}>
      <div className="FilePane-header">
        <span className="title">{props.title}</span>
        <img src={props.headerImageUrl} alt={props.title} />
      </div>
      <Droppable droppableId={props.droppableId}>
        {(provided, snapshot) => (
          <div
            className={getDroppableClasses(snapshot, 'FilePane-files-container')}
            ref={provided.innerRef}
            {...provided.droppableProps}
            >
            <div className="table-header table-row">
              <span>
                <input type="checkbox" onChange={onAllFilesCheckboxToggled} />
              </span>
              <span>Name</span>
              <span>Type</span>
              <span>Size</span>
              <span>Last Modified</span>
            </div>
            {props.rootDir?.contents.map((item, idx) => generateFileOrFolderElement(item, idx, props.openFile))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
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

export default FileManager;
