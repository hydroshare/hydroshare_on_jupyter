import SnackbarUtil from "../components/SnackbarUtil";

export interface ResultSnackbar {
  emitResultMessage: (result: boolean, context?: string) => void;
}

// NOTE: this assumes that `SnackbarUtilsConfigurator` from "../components/SnackbarUtil" is inside a
// SnackbarProvider.
//
// takes two result message strings, Ok and Err.
// returns a Fn that takes a bool and optional context string. if context string is present, it is
// appended to ok and err message text. If true, emits okay message, false error message.
export function resultSnackbar(okMsg: string, errMsg: string): ResultSnackbar {
  function emitResultMessage(result: boolean, context?: string): void {
    result
      ? SnackbarUtil.success(`${okMsg}${context}`)
      : SnackbarUtil.error(`${errMsg}${context}`, { persist: true });
  }

  return { emitResultMessage };
}

export default resultSnackbar;
