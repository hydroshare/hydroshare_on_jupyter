import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from "@jupyterlab/application";

import { MainAreaWidget } from "@jupyterlab/apputils";
import { ILauncher } from "@jupyterlab/launcher";
import { IDocumentManager } from "@jupyterlab/docmanager";
import { Token } from "@lumino/coreutils";
import { App } from "./app";
import CuahsiLogo from "./assets/logo";
/**
 * The command IDs used by the react-widget plugin.
 */
namespace CommandIDs {
  export const create = "create-react-widget";
}

const REQUIRED_SERVICES: Token<any>[] = [IDocumentManager];

/**
 * Initialization data for the react-widget extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: "hydroshare_on_jupyter",
  autoStart: true,
  optional: [ILauncher],
  requires: REQUIRED_SERVICES,
  activate: (
    app: JupyterFrontEnd,
    docManager: IDocumentManager,
    launcher: ILauncher
  ) => {
    const { commands } = app;

    const command = CommandIDs.create;
    commands.addCommand(command, {
      caption: "Create a new React Widget",
      label: "HydroShare on Jupyter",
      icon: CuahsiLogo,
      execute: () => {
        // NOTE: if passing services to react app becomes cumbersome and difficult to maintain, it
        // may be desirable to pass a registry function that encapsulates services and their methods.
        const content = new App(docManager);
        const widget = new MainAreaWidget({ content });
        widget.title.label = "HydroShare on Jupyter";
        widget.title.icon = CuahsiLogo;
        app.shell.add(widget, "main");
      },
    });

    if (launcher) {
      launcher.add({
        command,
      });
    }
  },
};

export default extension;
