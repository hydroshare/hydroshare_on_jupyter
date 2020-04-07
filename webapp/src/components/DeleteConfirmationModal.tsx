import * as React from 'react';
import Modal from './Modal';

type DeleteConfirmationModalProps = {
  close: () => any
  submit: () => any
  paths: string[]
};

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = (props: DeleteConfirmationModalProps) => {
  // Remove the prefix (i.e. hs: or local:) from each path
  const pathsCleaned = props.paths.map(p => p.split(':')[1]);
  const count = pathsCleaned.length;
  const message = `Are you sure you want to delete the following ${count} item${count === 1 ? '' : 's'}?`;
  return (
    <Modal close={props.close} title="Confirm Deletion" submit={props.submit} isValid={true} submitText="Delete">
      <p>{message}</p>
      {pathsCleaned.map(p => <p>{p}</p>)}
    </Modal>
  );
};

export default DeleteConfirmationModal;
