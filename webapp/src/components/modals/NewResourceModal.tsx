import * as React from 'react';
import { ICreateResourceRequest } from '../../store/types';

import Modal, {
  RadioInput,
  TextArea,
  TextInput,
} from './Modal';

import '../../styles/NewResourceModal.scss';

interface INewResourceModalProps {
  close: () => any
  createResource: (newResource: ICreateResourceRequest) => any
}

interface INewResourceModalState {
  abstract: string
  title: string
  privacy: string
}

const initialState: INewResourceModalState = {
  abstract: '',
  title: '',
  privacy: 'Private',
};

const NewResourceModal: React.FC<INewResourceModalProps> = (props: INewResourceModalProps) => {

  const [state, setState] = React.useState(initialState);

  const setAbstract = (abstract: string) => setState({...state, abstract});
  const setPrivacy = (privacy: string) => setState({...state, privacy});
  const setTitle = (title: string) => setState({...state, title});
  const createNewResource = () => props.createResource(state);
  const isValid = state.title.length > 0;

  return (
    <Modal
      submit={createNewResource}
      title="Create New Resource"
      submitText="Create"
      close={props.close}
      isValid={isValid}
    >
      <TextInput title="Title" onChange={setTitle} value={state.title}/>
      <TextArea title="Abstract" onChange={setAbstract} value={state.abstract}/>
      <RadioInput choices={['Public', 'Private']} onChange={setPrivacy} selected={state.privacy} title="Privacy"/>
    </Modal>
  );
};

export default NewResourceModal;
