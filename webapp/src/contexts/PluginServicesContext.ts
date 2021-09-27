import { IDocumentManager } from "@jupyterlab/docmanager";
import { createContext } from "react";

export interface IPluginServicesContext {
  docManager: IDocumentManager;
  dataDirectory: string;
  serverRoot: string;
}

export const PluginServicesContext = createContext<IPluginServicesContext>(
  undefined!
);

export default PluginServicesContext;
