import { LabIcon } from "@jupyterlab/ui-components";
import logo from "./logo_flat.svg";

// see https://github.com/jupyterlab/jupyterlab/blob/master/packages/ui-components/README.md for details
export const CuahsiLogo: LabIcon = new LabIcon({
  name: "CUAHSI",
  svgstr: logo,
});

export default CuahsiLogo;
