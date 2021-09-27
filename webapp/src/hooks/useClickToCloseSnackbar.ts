import {
  useSnackbar,
  SnackbarMessage,
  OptionsObject,
  SnackbarKey,
  ProviderContext,
} from "notistack";

export const useClickToCloseSnackbar = (): ProviderContext => {
  const { enqueueSnackbar: enqueue, closeSnackbar } = useSnackbar();

  const enqueueSnackbar = (
    message: SnackbarMessage,
    options?: OptionsObject | undefined
  ): SnackbarKey => {
    const id = enqueue(message, {
      ...options,
      style: { top: "55px" },
      onClick: () => closeSnackbar(id),
    });
    return id;
  };

  return { enqueueSnackbar, closeSnackbar };
};

export default useClickToCloseSnackbar;
