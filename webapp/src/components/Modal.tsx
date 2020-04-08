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
  isWarning?: boolean
}

const Modal: React.FC<IModalProps> = (props: IModalProps) => {

  let submitButtonClasses = '';
  if (props.isWarning) {
    submitButtonClasses += 'warn ';
  }

  return (
    <div className="Modal">
      <div className="overlay"/>
      <div className="content">
        <div className="header">
          <span className="title">{props.title}</span>
          <button className="close" onClick={props.close}>{CloseXSVG}</button>
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
            className={submitButtonClasses}
            onClick={props.submit}
            disabled={!props.isValid}>
            {props.submitText || 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

const CloseXSVG = (
  <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 13.229 13.229">
    <g strokeWidth="1.5" strokeLinecap="round">
      <path d="M12.76.47L.47 12.76M.505.505l12.22 12.22" />
    </g>
  </svg>
);

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
