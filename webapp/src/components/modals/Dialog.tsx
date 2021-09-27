import React, { useRef, useState } from "react";
import { DialogActions } from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import Button from "@material-ui/core/Button";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { useAppSelector } from "../../store/hooks";
import LoginForm from "./LoginForm";
import { ICloseWidget } from "../../app";
import { FormikProps } from "formik";

export const FormDialog: React.FC<ICloseWidget> = ({ close }) => {
  const loginState = useAppSelector(({ login }) => login.status);

  const formRef = useRef<FormikProps<any>>(null);
  const [failedLoginAttempt, setFailedLoginAttempt] = useState<boolean>(false);

  return (
    <div>
      <Dialog
        // Open if use is not logged in
        open={!loginState}
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
