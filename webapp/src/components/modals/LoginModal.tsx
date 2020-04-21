import * as React from 'react';
import { connect } from 'react-redux';
import { ThunkDispatch } from "redux-thunk";
import {
  IRootState,
} from "../../store/types";
import {
  loginToHydroShare,
} from '../../store/async-actions';

import Modal, {
  CheckboxInput,
  TextInput,
} from "./Modal";

interface ILoginModalState {
  loginInvalid: false
  password: string
  remember: boolean
  username: string
}

const mapStateToProps = ({ user }: IRootState) => {
  return {
    attemptingLogin: user.attemptingLogin,
    authenticationFailed: user.authenticationFailed,
    credentialsInvalid: user.credentialsInvalid,
    visible: user.authenticationFailed,
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, any>) => ({
  login: (username: string, password: string, remember: boolean) => dispatch(loginToHydroShare(username, password, remember)),
});

const initialState: ILoginModalState = {
  loginInvalid: false,
  password: '',
  remember: false,
  username: '',
};

type ComponentPropTypes = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

const LoginModal: React.FC<ComponentPropTypes> = (props: ComponentPropTypes) => {
  if (!props.visible) return null;

  const [state, setState] = React.useState(initialState);

  const usernameChange = (username: string) => setState({...state, username});
  const passwordChange = (password: string) => setState({...state, password});
  const rememberChange = (remember: boolean) => setState({...state, remember});

  const isValid = state.username.length > 0 && state.password.length > 0;

  const submit = () => props.login(state.username, state.password, state.remember);

    return (
      <Modal
        close={() => {}}
        title="Login to HydroShare"
        isValid={isValid && !props.attemptingLogin}
        submit={submit}
        submitText="Login"
      >
        <TextInput placeholder="Username" onChange={usernameChange} value={state.username} pattern="^[\w,\-\.]+$"/>
        <TextInput placeholder="Password" onChange={passwordChange} value={state.password} isPassword={true}/>
        {props.credentialsInvalid && <p className="error">Sorry, that username and password is incorrect.</p>}
        <CheckboxInput checked={state.remember} label="Remember" onChange={rememberChange} />
      </Modal>
    );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginModal);
