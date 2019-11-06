import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Form} from 'react-bootstrap';
import ContextMenu from 'react-context-menu';
// import { FaFileMedical, FaRegFolder, FaRegFolderOpen, FaSearch, FaTrashAlt } from "react-icons/fa";
// import { Col } from 'reactstrap';

import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/ResourceList.css';

import * as ResourceListActions from '../store/actions/ResourceList';
import {
  ResourceListActionTypes,
  IRootState,
} from '../store/types';

const mapStateToProps = ({ resourceList }: IRootState) => {
  const { resources } = resourceList;
  return { resources };
};

const mapDispatchToProps = (dispatch: Dispatch<ResourceListActionTypes>) => {
  return {
    goToFiles: (name: string) => dispatch(ResourceListActions.goToFiles(name))
  }
};

type ReduxType = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;


class ResourceList extends React.Component<ReduxType, never> {
  // TODO: Keep the input state in the Redux store so that it's preserved if the user navigates to view the
  // resource details/contents and then comes back to the previous page (?)

  /*public onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({inputText: e.target.value});
  }

  public onAddClick = () => {
    this.props.addItem(this.state.inputText);
    this.setState({inputText: ''});
  }*/
    public deleteClick =() => {
        console.log("Send message to backend to delete")
    }

    public createNewResource =() => {
        console.log("Send message to backend to create new resource")
    }

    public handleSortByChange = (e: any) => {
        console.log("Sort by" + e.value)
    }

    public goToFiles = (e: any) => {
      console.log("go to file")
    }
  /*public createResourcesList = () => {
    for resource in this.props.resources {

    }
  }*/

  public render() {
    const { resources } = this.props;

    return (
        <div className='resourcesParent'>
            {resources.map((resource, i) => {     
              console.log("Entered");                    
              return (
                <div key={i} className='resourcesLine' id={i+'-menu'} onClick={this.goToFiles}> 
                  <Form className='checkbox-form'>
                    <Form.Check 
                      type='checkbox'
                      id={`default-checkbox`}
                    />
                  </Form>
                  <div className='resource-name'>{resource.name}</div>
                  <div className='resource-author'>{resource.author}</div>
                  <div className='resource-lastModified'>{resource.lastModified}</div>
                  <div className='resource-status'>{resource.status}</div>
                  <ContextMenu contextId={i+'-menu'} items={[{label: 'Rename'}, {label: 'Delete'}, {label: 'Publish to Hydroshare'}, , {label: 'Locate in Hydroshare'}]} />
                   </div>) 
            })}
        </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ResourceList);