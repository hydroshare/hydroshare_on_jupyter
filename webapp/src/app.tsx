import { ReactWidget } from "@jupyterlab/apputils";
import { IDocumentManager } from "@jupyterlab/docmanager";
import { Widget } from "@lumino/widgets";
import { Box, createTheme, Theme, ThemeProvider } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { setChonkyDefaults } from "chonky";
import { ChonkyIconFA } from "chonky-icon-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Redirect, Switch } from "react-router-dom";
import { AppRoute } from "./AppRoute";
import AppBar from "./components/AppBar";
import FormDialog from "./components/modals/Dialog";
import { ResourceGrid } from "./components/ResourceGrid";
import { ResourcePage } from "./components/ResourcePage";
import { PluginServicesContext } from "./contexts";
import store from "./store/store";
import { IDataDirectory } from "./store/sync-api/interfaces";
import { PageConfig } from "@jupyterlab/coreutils";
import { SnackbarProvider, SnackbarProviderProps } from "notistack";
import SingleSlide from "./components/SingleSlide";

// setup chonky
setChonkyDefaults({ iconComponent: ChonkyIconFA });

export interface ICloseWidget {
  close: () => void;
}

export interface IDocManager {
  docManager: IDocumentManager;
}

type ReactAppProps = ICloseWidget & IDocManager;

const useRenders = (): number => {
  const renders = useRef(0);
  renders.current++;
  return renders.current;
};

const defaultTheme = createTheme({});

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    height: "inherit",
    position: "absolute",
    top: "0",
    width: "100%",
  },
}));

const snackbarConfig: Omit<SnackbarProviderProps, "children"> = {
  anchorOrigin: { vertical: "top", horizontal: "right" },
  TransitionComponent: SingleSlide,
  autoHideDuration: 5000, // 5 seconds
};

// This also works and is likely what will be implemented in the future.
const ReactApp: React.FC<ReactAppProps> = ({ close, docManager }) => {
  const renders = useRenders();
  const classes = useStyles();
  const [dataDirectory, setDataDirectory] = useState<string>(undefined!);

  const serverRoot = PageConfig.getOption("preferredDir");

  useEffect(() => {
    async function fetchDataDirectory() {
      const res = await fetch("/syncApi/data_directory");
      const data: IDataDirectory = await res.json();
      setDataDirectory(data.data_directory);
    }
    fetchDataDirectory();
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider theme={defaultTheme}>
        <SnackbarProvider {...snackbarConfig}>
          <Box className={classes.root}>
            <Router>
              <AppBar />
              <FormDialog close={close} />
              {/* Redirect to home page if the app has only been rendered once. */}
              {renders === 1 && <Redirect to="/" />}
              <PluginServicesContext.Provider
                value={{ docManager, dataDirectory, serverRoot }}
              >
                <Switch>
                  {/* Routes are only accessible post login */}
                  <AppRoute exact path="/" component={ResourceGrid} />
                  <AppRoute
                    path="/resources/:resource_id"
                    component={ResourcePage}
                  />
                </Switch>
              </PluginServicesContext.Provider>
            </Router>
          </Box>
        </SnackbarProvider>
      </ThemeProvider>
    </Provider>
  );
};

export class App extends ReactWidget {
  docManager: IDocumentManager;

  constructor(docManager: IDocumentManager, options: Widget.IOptions = {}) {
    super(options);
    this.docManager = docManager;
  }

  render() {
    // pass prop func for closing widget
    return (
      <ReactApp
        docManager={this.docManager}
        close={() => this.parent?.close()}
      />
    );
  }
}
export default App;
