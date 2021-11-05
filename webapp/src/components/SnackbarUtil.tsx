// from: https://github.com/iamhosseindhv/notistack/issues/30#issuecomment-542863653
import { VariantType, WithSnackbarProps, OptionsObject } from "notistack";
import { useClickToCloseSnackbar } from "../hooks/useClickToCloseSnackbar";

let useSnackbarRef: WithSnackbarProps;
export const SnackbarUtilsConfigurator = () => {
  useSnackbarRef = useClickToCloseSnackbar();
  return null;
};

export default {
  success(msg: string, options?: Omit<OptionsObject, "variant">) {
    this.toast(msg, "success", options);
  },
  warning(msg: string, options?: Omit<OptionsObject, "variant">) {
    this.toast(msg, "warning", options);
  },
  info(msg: string, options?: Omit<OptionsObject, "variant">) {
    this.toast(msg, "info", options);
  },
  error(msg: string, options?: Omit<OptionsObject, "variant">) {
    this.toast(msg, "error", options);
  },
  toast(
    msg: string,
    variant: VariantType = "default",
    options?: Omit<OptionsObject, "variant">
  ) {
    useSnackbarRef.enqueueSnackbar(msg, { variant, ...options });
  },
};
