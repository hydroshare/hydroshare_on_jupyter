import React, { useMemo, useState } from "react";
import { Formik, Form, FieldAttributes, useField, FormikProps } from "formik";
import {
  TextField,
  TextFieldProps,
  FormGroup,
  makeStyles,
} from "@material-ui/core";
import * as yup from "yup";
import { useLoginMutation } from "../../store/sync-api";
import { useAppDispatch } from "../../store/hooks";
import { login } from "../../store/actions";
import { useHistory } from "react-router-dom";
import { fileSystemWebSocket } from "../../communication/ws";

type LoginFormFields = {
  username: string;
  password: string;
};

const initialFormFields: LoginFormFields = {
  username: "",
  password: "",
};

const formSchema = yup.object().shape({
  username: yup.string().required().min(1),
  password: yup.string().required().min(1),
});

const ErrorableTextField: React.FC<TextFieldProps & FieldAttributes<{}>> = ({
  type,
  ...props
}) => {
  const [field, meta] = useField<{}>(props);
  const joinedProps = { ...props, ...field };
  const errorText = meta.error && meta.touched ? meta.error : "";
  return (
    <TextField
      {...joinedProps}
      type={type}
      helperText={errorText}
      error={!!errorText}
    />
  );
};

const formGroupStyle = makeStyles({
  root: {
    alignContent: "center",
  },
});

interface LoginFormProps {
  formRef: React.Ref<FormikProps<any>>;
  loginAttemptStatus: React.Dispatch<boolean>;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  formRef,
  loginAttemptStatus,
}) => {
  const formStyle = formGroupStyle();
  const [loginUser, { isError }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const history = useHistory();
  const [ws, setWs] = useState<WebSocket | null>(null);

  useMemo(() => loginAttemptStatus(isError), [isError]);

  const onSubmit = async ({ username, password }: LoginFormFields) => {
    const user = await loginUser({ username, password }).unwrap();

    if (user.success) {
      // dispatch login to redux
      dispatch(login());
      // push user to home page
      history.push("/");
      // open websocket connection with backend
      fileSystemWebSocket();
    } else {
      // emit some notification
    }
  };

  return (
    <Formik
      initialValues={initialFormFields}
      innerRef={formRef}
      onSubmit={async (values) => {
        // do something with values
        await onSubmit(values);
      }}
      validationSchema={formSchema}
    >
      <Form>
        <FormGroup
          classes={{
            root: formStyle.root,
          }}
        >
          <ErrorableTextField
            placeholder="username"
            name="username"
            type="text"
          />
          <ErrorableTextField
            placeholder="password"
            name="password"
            type="password"
          />
        </FormGroup>
      </Form>
    </Formik>
  );
};

export default LoginForm;
