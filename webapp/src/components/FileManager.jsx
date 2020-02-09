/**
 * This is a test of the react-beautiful-dnd package. It should be restructured significantly if it is to be used.
 * Tutorial illustrating how to customize appearing during a drag:
 * https://egghead.io/lessons/react-customise-the-appearance-of-an-app-during-a-drag-using-react-beautiful-dnd-snapshot-values
 */

import * as React from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
} from 'react-beautiful-dnd';

class FileManager extends React.Component {

  state = {
    files: [
      'Hello!',
      'Hello! 2',
      'Hello! 3',
      'Hello! 4',
    ],
  };

  render() {
    return (
      <DragDropContext>
        <div>
          <Droppable droppableId="drop1">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{backgroundColor: snapshot.isDraggingOver ? 'red' : 'white'}}
              >
                {this.state.files.map((f, idx) => (
                  <File
                    key={f}
                    id={f}
                    index={idx}
                    name={f}
                  />
                ))}
                <Folder name={"Test"} />
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>
    );
  }
};

const Item = (props) => <p>{props.name}</p>;

const File = (props) => (
  <Draggable
    draggableId={props.id}
    index={props.index}
    key={props.id}
  >
    {provided => (
      <div
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        ref={provided.innerRef}
        >
        <Item name={props.name} />
      </div>
    )}
  </Draggable>
);

const Folder = (props) => (
  <Droppable droppableId="drop2">
    {(provider, snapshot) => (
      <div
        ref={provider.innerRef}
        {...provider.droppableProps}
        style={{backgroundColor: snapshot.isDraggingOver ? 'green' : 'white'}}
      >
        <Item name={'Folder: ' + props.name} />
        {provider.placeholder}
      </div>
    )}
  </Droppable>
);


export default FileManager;
