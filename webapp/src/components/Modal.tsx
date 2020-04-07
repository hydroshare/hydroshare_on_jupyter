import * as React from 'react';

import '../styles/Modal.scss';

interface IModalProps {
  cancelText?: string
  close: () => any
  children: React.ReactNode
  title: string
  submit: () => any
  submitText?: string
  isValid: boolean
}

const Modal: React.FC<IModalProps> = (props: IModalProps) => {

  return (
    <div className="Modal">
      <div className="overlay"/>
      <div className="content">
        <div className="header">
          <h1>{props.title}</h1>
          <button onClick={props.close}>X</button>
        </div>
        <div className="body">
          {props.children}
        </div>
        <div className="footer">
          <button
            onClick={props.close}>
            {props.cancelText || 'Cancel'}
          </button>
          <button
            onClick={props.submit}
            disabled={!props.isValid}>
            {props.submitText || 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

type TextInputProps = {
  title: string
  onChange: (newValue: string) => any
  placeholder?: string
  value: string
};

export const TextInput: React.FC<TextInputProps> = (props: TextInputProps) => {

  const textInputChange = (e: React.ChangeEvent<HTMLInputElement>) => props.onChange(e.target.value);

  return (
    <div className="TextInput group">
      <h2 className="title">{props.title}</h2>
      <div className="group-content">
        <input type="text" value={props.value} onChange={textInputChange} placeholder={props.placeholder}/>
      </div>
    </div>
  )
};

export default Modal;
