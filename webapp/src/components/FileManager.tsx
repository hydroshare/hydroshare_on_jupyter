/**
 * This is a test of the react-beautiful-dnd package. It should be restructured significantly if it is to be used.
 * Tutorial illustrating how to customize appearing during a drag:
 * https://egghead.io/lessons/react-customise-the-appearance-of-an-app-during-a-drag-using-react-beautiful-dnd-snapshot-values
 */

import * as React from 'react';
import {
  DragDropContext,
  Draggable,
  DraggableStateSnapshot,
  Droppable,
  DroppableStateSnapshot,
} from 'react-beautiful-dnd';
import * as moment from "moment";

import '../styles/FileManager.scss';

import {
  IFileOrFolder,
} from "../store/types";

interface IFileManagerProps {
  hydroShareFilesAndFolders: IFileOrFolder[]
  jupyterHubFilesAndFolders: IFileOrFolder[]
}

// TODO: Define the shape of result
const onDragEnd = (result: any) => {
  console.log("Drag ended!");
};

const FileManager: React.FC<IFileManagerProps> = (props: IFileManagerProps) => {
  const hydroShareFilePane = props.hydroShareFilesAndFolders ? (
    <FilePane droppableId="hydroshare-file-pane" idPrefix="hs" contents={props.hydroShareFilesAndFolders}/>
  ) : null;
  const jupyterHubFilePane = props.jupyterHubFilesAndFolders ? (
    <FilePane droppableId="jupyterhub-file-pane" idPrefix="jh" contents={props.jupyterHubFilesAndFolders}/>
  ) : null;
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="FileManager">
        {hydroShareFilePane}
        {jupyterHubFilePane}
      </div>
    </DragDropContext>
  );
};

interface IFilePaneProps {
  contents: IFileOrFolder[]
  droppableId: string
  idPrefix: string
}

const getStyles = (snapshot: DroppableStateSnapshot | DraggableStateSnapshot, nestLevel: number = 0) => {
  return {};
};

const generateTableCell = (content: string | number | moment.Moment) => {
  if (moment.isMoment(content)) {
    return <span>{content.format('MMM D, YYYY')}</span>
  } else {
    return <span>{content}</span>;
  }
};

const generateFolderElement = (folder: IFileOrFolder, index: number, idPrefix: string, nestLevel: number = 0) => {
  const itemFullPath = `${idPrefix}:${folder.dirPath}/${folder.name}`;
  const folderLineItem = (
    <Draggable draggableId={itemFullPath} index={0} key={itemFullPath}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
          >
            {folder.name}
          </div>
        )}
      </Draggable>
  );

  const folderContentsLineItems = folder.contents?.map((item, idx) =>
    generateFileOrFolderElement(item, idx+1, idPrefix,nestLevel+1));

  return (
    <Droppable droppableId={itemFullPath} key={itemFullPath}>
      {(provided, snapshot) => (
      <div
        ref={provided.innerRef}
        {...provided.droppableProps}
      >
        {folderLineItem}
        {folderContentsLineItems}
      </div>
    )}
    </Droppable>
  );
};

const generateFileElement = (item: IFileOrFolder, index: number, idPrefix: string, nestLevel: number = 0) => {
  const itemFullPath = `${idPrefix}:${item.dirPath}/${item.name}.${item.type}`;
  return (
    <Draggable draggableId={itemFullPath} index={index} key={itemFullPath}>
      {(provided, snapshot) => (
        <div
          className="file-element"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {generateTableCell(item.name)}
          {generateTableCell(item.type)}
          {generateTableCell(getFormattedSizeString(item.sizeBytes))}
          {generateTableCell(item.lastModified || 'Unknown')}
        </div>
      )}
    </Draggable>
  );
};

const generateFileOrFolderElement = (item: IFileOrFolder, index: number, idPrefix: string, nestLevel: number = 0) => {
  if (item.contents) {
    return generateFolderElement(item, index, idPrefix, nestLevel);
  } else {
    return generateFileElement(item, index, idPrefix, nestLevel);
  }
};

const FilePane: React.FC<IFilePaneProps> = (props: IFilePaneProps) => {

  const onAllFilesCheckboxToggled = () => console.log("Checked!");

  return (
    <div className="FilePane">
      <div className="FilePane-header">
        <span>
          <input type="checkbox" onChange={onAllFilesCheckboxToggled} />
        </span>
        <span>Name</span>
        <span>Type</span>
        <span>Size</span>
        <span>Last Modified</span>
      </div>
      <Droppable droppableId={props.droppableId}>
        {(provided, snapshot) => (
          <div
            className="FilePane-files-container"
            style={getStyles(snapshot)}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {props.contents.map((item, idx) => generateFileOrFolderElement(item, idx, props.idPrefix))}
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
  const log10 = Math.log10(sizeBytes);
  const labelIndex = Math.floor(log10 / 3);
  const sizeInHumanReadableUnits = Math.round(sizeBytes / Math.pow(10, log10));
  return `${sizeInHumanReadableUnits}${HUMAN_READABLE_FILE_SIZES[labelIndex]}`;
};

export default FileManager;
