import React, { useRef, useState, useEffect } from "react";
import { DialogActions } from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import Button from "@material-ui/core/Button";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import LoginForm from "./LoginForm";
import { ICloseWidget } from "../../app";
import { FormikProps } from "formik";
import {
  useUsingOAuthQuery,
  useOAuthLoginMutation,
} from "../../store/sync-api";
import { login } from "../../store/actions";
import { fileSystemWebSocket } from "../../communication/ws";

export const FormDialog: React.FC<ICloseWidget> = ({ close }) => {
  const loginState = useAppSelector(({ login }) => login.status);
  const dispatch = useAppDispatch();

  // isFetching will be true for both the first request fired off, as well as subsequent requests.
  // https://redux-toolkit.js.org/rtk-query/usage/queries#frequently-used-query-hook-return-values
  const { data, isFetching } = useUsingOAuthQuery();
  const [loginWithOAuth, _] = useOAuthLoginMutation();

  const formRef = useRef<FormikProps<any>>(null);
  const [failedLoginAttempt, setFailedLoginAttempt] = useState<boolean>(false);

  useEffect(() => {
    async function asyncLogin() {
      if (data && data.client_id && data.token) {
        const res = await loginWithOAuth(data).unwrap();
        // if success, set login to true
        console.log(res.success);

        if (res.success) {
          dispatch(login());
          // push user to home page
          // history.push("/");
          // open websocket connection with backend
          fileSystemWebSocket();
        }
      }
    }

    asyncLogin();
  }, [data]);

  return (
    <div>
      <Dialog
        // Open if use is not logged in
        open={!loginState && !isFetching}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Login to HydroShare</DialogTitle>
        <DialogContent>
          {failedLoginAttempt && (
            <DialogContentText color="error">
              Invalid credentials
            </DialogContentText>
          )}
          <LoginForm
            formRef={formRef}
            loginAttemptStatus={setFailedLoginAttempt}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => formRef?.current?.handleSubmit()}
            color="primary"
          >
            Login
          </Button>
          <Button onClick={close} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FormDialog;
