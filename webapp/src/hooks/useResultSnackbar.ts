import useClickToCloseSnackbar from "./useClickToCloseSnackbar";

export interface ResultSnackbar {
  emitResultMessage: (result: boolean, context?: string) => void;
}

// takes two result message strings, Ok and Err.
// returns a Fn that takes a bool and optional context string. if context string is present, it is
// appended to ok and err message text. If true, emits okay message, false error message.
export function useResultSnackbar(
  okMsg: string,
  errMsg: string
): ResultSnackbar {
  // error messages are persisted
  const { enqueueSnackbar } = useClickToCloseSnackbar();

  function emitResultMessage(result: boolean, context?: string): void {
    result
      ? enqueueSnackbar(`${okMsg}${context}`, {
          variant: "success",
        })
      : enqueueSnackbar(`${errMsg}${context}`, {
          variant: "error",
          persist: true,
        });
  }

  return { emitResultMessage };
}

export default useResultSnackbar;
