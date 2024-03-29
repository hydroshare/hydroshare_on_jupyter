import React from "react";

import "../../styles/Modal.scss";

interface IModalProps {
  cancelText?: string;
  close: () => any;
  children: React.ReactNode;
  title: string;
  placeholder?: string;
  submit: () => any;
  submitText?: string;
  isValid: boolean;
  isWarning?: boolean;
  isConfirm?: boolean;
  isCancelDisabled?: boolean;
  isCloseDisabled?: boolean;
}

/**
 * General modal component that other modals are built off of
 * @example ./LoginModal.tsx or ./DeleteLocallyConfirmationModal.tsx
 */

const Modal: React.FC<IModalProps> = (props: IModalProps) => {
  let submitButtonClasses = "";
  if (props.isWarning) {
    submitButtonClasses += "warn ";
  } else if (props.isConfirm) {
    submitButtonClasses += "confirm ";
  }

  return (
    <div className="Modal">
      <div className="overlay" />
      <div className="content">
        <div className="header">
          <span className="title">{props.title}</span>
          <button
            className="close"
            onClick={props.close}
            disabled={props.isCloseDisabled}
          >
            {CloseXSVG}
          </button>
        </div>
        <div className="body">{props.children}</div>
        <div className="footer">
          <button
            id="cancelButtonId"
            onClick={props.close}
            disabled={props.isCancelDisabled}
          >
            {props.cancelText || "Cancel"}
          </button>
          <button
            className={submitButtonClasses}
            onClick={props.submit}
            disabled={!props.isValid}
          >
            {props.submitText || "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

const CloseXSVG = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="50"
    height="50"
    viewBox="0 0 13.229 13.229"
  >
    <g strokeWidth="1.5" strokeLinecap="round">
      <path d="M12.76.47L.47 12.76M.505.505l12.22 12.22" />
    </g>
  </svg>
);

type CheckboxInputProps = {
  checked: boolean;
  label: string;
  onChange: (isChecked: boolean) => any;
  title?: string;
};

export const CheckboxInput: React.FC<CheckboxInputProps> = (
  props: CheckboxInputProps
) => {
  const onSelectionChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    props.onChange(e.target.checked);

  return (
    <div className="CheckboxInput group">
      <h2 className="title">{props.title || ""}</h2>
      <div className="group-content">
        <label>
          <input
            onChange={onSelectionChange}
            type="checkbox"
            checked={props.checked}
          />
          {props.label}
        </label>
      </div>
    </div>
  );
};

type TextInputProps = {
  isPassword?: boolean;
  title?: string;
  onChange: (newValue: string) => any;
  pattern?: string;
  placeholder?: string;
  value: string;
};
export const TextArea: React.FC<TextInputProps> = (props: TextInputProps) => {
  const textareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    props.onChange(e.target.value);

  return (
    <div className="TextArea group">
      <h2 className="title">{props.title || ""}</h2>
      <div className="group-content">
        <textarea
          value={props.value}
          onChange={textareaChange}
          placeholder={props.placeholder}
        />
      </div>
    </div>
  );
};

export const TextInput: React.FC<TextInputProps> = (props: TextInputProps) => {
  const textInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    props.onChange(e.target.value);

  const type = props.isPassword ? "password" : "text";

  return (
    <div className="TextInput group">
      <h2 className="title">{props.title || ""}</h2>
      <div className="group-content">
        <input
          type={type}
          value={props.value}
          onChange={textInputChange}
          placeholder={props.placeholder}
          pattern={props.pattern}
        />
      </div>
    </div>
  );
};

type RadioInputProps = {
  default?: string;
  choices: string[];
  onChange: (newValue: string) => any;
  selected: string;
  title: string;
};

export const RadioInput: React.FC<RadioInputProps> = (
  props: RadioInputProps
) => {
  const onSelectionChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    props.onChange(e.target.value);

  return (
    <div className="RadioInput group">
      <h2 className="title">{props.title}</h2>
      <div className="group-content">
        {props.choices.map((c) => (
          <label>
            <input
              onChange={onSelectionChange}
              type="radio"
              value={c}
              checked={props.selected === c}
            />
            {c}
          </label>
        ))}
      </div>
    </div>
  );
};

export default Modal;
