import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { RouteComponentProps } from "react-router-dom";
import {
  GenericFileActionHandler,
  FullFileBrowser,
  FileActionHandler,
  ChonkyActions,
  FileBrowser,
  FileData,
  FileList,
  FileNavbar,
  FileToolbar,
  defineFileAction,
  ChonkyIconName,
} from "chonky";
import {
  OpenFilesPayload,
  ChangeSelectionPayload,
} from "chonky/dist/types/action-payloads.types";
import syncApi, {
  useDataDirectoryQuery,
  useDownloadResourceEntityQuery,
  useListHydroShareResourceFilesQuery,
  useUploadResourceEntityMutation,
} from "../store/sync-api";
import store from "../store/store";
import { Paper, CircularProgress } from "@material-ui/core";
import {
  IResourceFiles,
  IResourceFilesRequest,
  IResourceFileDownloadRequest,
} from "../store/sync-api/interfaces";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { FSState } from "../store/reducers";
import path from "path";

// icon imports
import SyncIcon from "@material-ui/icons/Sync";
import SyncDisabledIcon from "@material-ui/icons/SyncDisabled";
import ComputerIcon from "@material-ui/icons/Computer";
// only on hydroshare: HydroShare icon

export const ResourceActions = {
  OpenResourceOnHydroShare: defineFileAction({
    id: "open_resource_on_hydroshare",
    button: {
      name: "Open on HydroShare",
      toolbar: true,
      contextMenu: true,
      tooltip: "Open on HydroShare",
    },
  } as const),
  UploadFiles: defineFileAction({
    id: "upload_files",
    requiresSelection: true,
    button: {
      name: "Upload files",
      tooltip: "Upload files",
      toolbar: true,
      contextMenu: true,
      icon: ChonkyIconName.upload,
    },
  } as const),
  DownloadFiles: defineFileAction({
    id: "download_files",
    requiresSelection: true,
    button: {
      name: "Download files",
      tooltip: "Download files",
      toolbar: true,
      contextMenu: true,
      icon: ChonkyIconName.download,
    },
  } as const),
};

// source https://stackoverflow.com/a/53746948
export const StringUnion = <UnionType extends string>(
  ...values: UnionType[]
) => {
  Object.freeze(values);
  const valueSet: Set<string> = new Set(values);

  const guard = (value: string): value is UnionType => {
    return valueSet.has(value);
  };

  const check = (value: string): UnionType => {
    if (!guard(value)) {
      const actual = JSON.stringify(value);
      const expected = values.map((s) => JSON.stringify(s)).join(" | ");
      throw new TypeError(
        `Value '${actual}' is not assignable to type '${expected}'.`
      );
    }
    return value;
  };

  const unionNamespace = { guard, check, values };
  return Object.freeze(
    unionNamespace as typeof unionNamespace & { type: UnionType }
  );
};

export type ResourceActionHandler = GenericFileActionHandler<
  typeof ResourceActions[keyof typeof ResourceActions]
>;

export const LocalExists = StringUnion("only_local", "out_of_sync", "in_sync");
export type LocalExists = typeof LocalExists.type;

export interface FileStatus extends FileData {
  status?: "only_remote" | "only_local" | "out_of_sync" | "in_sync";
}

export interface OpenFilesFileStatusPayload extends OpenFilesPayload {
  targetFile?: FileStatus;
  files: FileStatus[];
}

export const FileStatusIcons = {
  in_sync: <SyncIcon />,
  only_local: <ComputerIcon />,
  only_remote: "HS",
  out_of_sync: <SyncDisabledIcon />,
};

import { ChonkyIconProps } from "chonky";
import { ChonkyIconFA } from "chonky-icon-fontawesome";
import { IDocumentManager } from "@jupyterlab/docmanager";
import { PluginServicesContext } from "../contexts";
import { OutputParametricSelector } from "reselect";
import useClickToCloseSnackbar from "../hooks/useClickToCloseSnackbar";
import { RestoreOutlined } from "@material-ui/icons";

export const FileStatusEmoji: React.FC<ChonkyIconProps> = React.memo(
  (props) => {
    const emojiIcon = FileStatusIcons[props.icon];
    const title = props.icon.split("_").join(" ");
    if (emojiIcon) {
      return <span title={title}>{emojiIcon}</span>;
    }
    return <ChonkyIconFA {...props} />;
  }
);

// TODO: move these to another module
const isDescendant = (parent: string, child: string): boolean =>
  child.startsWith(parent);

const isDirectDescendant = (parent: string, child: string): boolean => {
  if (isDescendant(parent, child)) {
    const truncatedChild = child.slice(parent.length);
    return !truncatedChild.includes("/");
  }
  return false;
};

export interface IResourcePageProps {
  resource_id: string;
}

const basename = (path: string): string => {
  const parts = path.split("/");
  return parts.at(-1) || "";
};

const flattenFSStateToFileStatusArray = ({
  resource_id,
  ...files
}: FSState): FileStatus[] => {
  return Object.keys(files).flatMap((key) =>
    files[key].map(
      (file: string) =>
        ({
          id: file,
          // TODO: use statusIcon property instead of prepended to the name
          name: basename(file),
          status: key,
          isDir: false,
          icon: key,
        } as FileStatus)
    )
  );
};

const ResourceFilesToFileStatusArray = (
  data: IResourceFiles | undefined
): FileStatus[] => {
  return data?.files
    ? data?.files?.map(
        (file: string) =>
          ({
            id: file,
            name: basename(file),
            isDir: false,
            icon: "only_remote",
          } as FileStatus)
      )
    : [];
};

const getDirectoryChildren = (
  currentDirectory: FileStatus,
  fileList: FileStatus[]
): FileStatus[] =>
  fileList.filter((file) => isDirectDescendant(currentDirectory.id, file.id));

const createIntermediateDirectories = (
  currentDirectory: FileStatus,
  fileList: FileStatus[]
): FileStatus[] => {
  const currentDirParts = currentDirectory.id.split("/");

  const dirIds = fileList
    // keep files that are descendants AND not direct descendants of parent
    .filter(
      (file): file is FileStatus =>
        isDescendant(currentDirectory.id, file.id) &&
        !isDirectDescendant(currentDirectory.id, file.id)
    )
    .map((file) => {
      // create directory ids
      return file.id.split("/").slice(0, currentDirParts.length).join("/");
    });

  // remove duplicate ids
  const uniqueDirIds = [...new Set(dirIds)];

  return uniqueDirIds.map(
    (id: string): FileStatus => ({
      id: `${id}/`,
      name: basename(id),
      isDir: true,
    })
  );
};

const createFilesArray = (
  currentDir: FileStatus,
  files: FileStatus[]
): FileStatus[] => {
  // get children of current directory
  const currentChildren = getDirectoryChildren(currentDir, files);

  // create intermediate directories
  const intermediateDirs = createIntermediateDirectories(currentDir, files);

  return [...currentChildren, ...intermediateDirs];
};

const absoluteFilepath = (
  filepathRelativeToResource: string,
  resource_id: string,
  dataDirectory: string
): string => {
  return `${dataDirectory}/${resource_id}/${resource_id}/${filepathRelativeToResource}`;
};

const filepathRelativeToJPServer = (
  filepathRelativeToResource: string,
  resource_id: string,
  dataDirectory: string,
  serverRoot: string
): string => {
  const absPath = absoluteFilepath(
    filepathRelativeToResource,
    resource_id,
    dataDirectory
  );
  // from, to
  const relativePath = path.relative(serverRoot, absPath);

  // return empty string if relative path is not direct descendant of `serverRoot`
  return relativePath.startsWith("..") ? "" : relativePath;
};

type ResourcePageProps = RouteComponentProps<IResourcePageProps>;

export const ResourcePage: React.FC<ResourcePageProps> = (props) => {
  const { enqueueSnackbar } = useClickToCloseSnackbar();

  const { docManager, dataDirectory, serverRoot } = useContext(
    PluginServicesContext
  );

  const resource_id = props.match.params.resource_id;
  const rootDir: FileStatus = {
    id: "data/contents/",
    name: "data/contents",
    isDir: true,
  };

  const [currentDirChain, setCurrentDirChain] = useState<FileStatus[]>([
    rootDir,
  ]);
  const [currentFiles, setCurrentFiles] = useState<FileStatus[]>([]);
  const [files, setFiles] = useState<FileStatus[]>([]);

  // determine source of truth. If the resource is not websocket redux store, make api call.
  const data = useAppSelector<FSState | undefined>(
    ({ fsState }) => fsState[resource_id]
  );
  const { data: apiData, isFetching } = useListHydroShareResourceFilesQuery(
    resource_id
  );

  // NOTE: I am not sure if this is the correct way to memoize this
  useMemo(() => {
    // if files are present in redux store, process them.
    if (data !== undefined) {
      setFiles(flattenFSStateToFileStatusArray(data));
    }
    // if files is undefined, make api call
    else {
      if (apiData) {
        setFiles(ResourceFilesToFileStatusArray(apiData));
      }
    }
  }, [data, apiData]);

  const handleAction = useCallback<FileActionHandler & ResourceActionHandler>(
    ({ action, ...actionData }) => {
      switch (action.id) {
        case ChonkyActions.OpenFiles.id:
          // logic for navigating the file tree
          const {
            targetFile,
          } = actionData.payload as OpenFilesFileStatusPayload;

          if (targetFile?.isDir) {
            const leafDir =
              currentDirChain.at(-1) || ({ id: "", name: "" } as FileData);

            if (targetFile.id.length > leafDir.id.length) {
              // navigate down the file tree
              setCurrentDirChain((state) => [...state, targetFile]);
            } else {
              // navigate up the file tree
              setCurrentDirChain((state) =>
                state.filter((dir) => dir.id.length <= targetFile.id.length)
              );
            }
          } else {
            // must be a file
            // verify that it is a local file
            if (targetFile?.status && LocalExists.guard(targetFile.status)) {
              if (path.relative(serverRoot, dataDirectory).startsWith("..")) {
                // show modal error
              }
              const filepathRelativeToServer = filepathRelativeToJPServer(
                targetFile!.id,
                resource_id,
                dataDirectory,
                serverRoot
              );

              // open file / reveal widget if file is descendent of Jupyter Lab `serverRoot`.
              // Jupyter cannot access files outside the `serverRoot` scope.
              if (filepathRelativeToServer) {
                docManager.openOrReveal(filepathRelativeToServer);
              } else {
                // Show modal error
                // const snackbarMessage = `Jupyter cannot access this file. HydroShare Sync Directory: ${dataDirectory} is not descendent of Jupyter server root: ${serverRoot}. Restart Jupyter session from parent of HydroShare Sync Directory.`;
                const snackbarMessage = (
                  <div>
                    Jupyter cannot access this file.
                    <br />
                    HydroShare Sync Directory: {dataDirectory} is not descendent
                    of Jupyter server root: {serverRoot}.
                    <br />
                    Restart Jupyter session from a parent of HydroShare Sync
                    Directory.
                  </div>
                );
                enqueueSnackbar(snackbarMessage, {
                  variant: "warning",
                  persist: true,
                });
              }
            } else {
              const snackbarMessage = "Invalid, cannot open non-local file";
              enqueueSnackbar(snackbarMessage, { variant: "warning" });
            }
          }
          break;
        case ResourceActions.OpenResourceOnHydroShare.id:
          // Open resource on HydroShare
          const resource_url = `https://hydroshare.org/resource/${resource_id}/`;
          window.open(resource_url, "_blank")?.focus();
          break;
        case ResourceActions.UploadFiles.id:
          {
            const { selectedFiles } = actionData.state;
            const payload: IResourceFilesRequest = {
              resource_id,
              files: selectedFiles.map((file) => file.id),
            };
            const result = store.dispatch(
              syncApi.endpoints.uploadResourceEntity.initiate(payload)
            );
            result.unsubscribe();
          }
          break;
        case ResourceActions.DownloadFiles.id:
          {
            const {
              selectedFiles,
            }: { selectedFiles: FileStatus[] } = actionData.state;

            // TODO: do something with futures
            // TODO: handle case when a directory is passed. All children of directory should be
            // passed as a request.
            selectedFiles.map((file) => {
              // guard for only_local files
              if (file.status === "only_local") {
                const snackbarMessage = `Cannot download local file: ${file.name}`;
                enqueueSnackbar(snackbarMessage, {
                  variant: "error",
                });
                return file;
              }

              const func = async () => {
                const rawResult = store.dispatch(
                  syncApi.endpoints.downloadResourceEntity.initiate({
                    resource_id,
                    file: file.id,
                  })
                );
                const result = await rawResult;
                rawResult.unsubscribe();
                const { status, error } = result;

                // emit file downloaded success message
                if (status === "fulfilled") {
                  const snackbarMessage = `Successfully downloaded: ${file.name}`;
                  enqueueSnackbar(snackbarMessage, {
                    variant: "success",
                  });
                }

                // emit error if download fails
                if (error) {
                  const snackbarMessage = `File download: ${file.name} failed`;
                  enqueueSnackbar(snackbarMessage, {
                    variant: "error",
                    persist: true,
                  });
                }
                return result;
              };

              return func();
            });
          }
          break;
        default:
          break;
      }
    },
    [currentDirChain, resource_id]
  );

  const supportedActions = [
    ChonkyActions.OpenFiles,
    ChonkyActions.ClearSelection,
    ResourceActions.UploadFiles,
    ResourceActions.DownloadFiles,
    ResourceActions.OpenResourceOnHydroShare,
  ];

  useEffect(() => {
    const leafDir = currentDirChain.at(-1) || rootDir;
    // update files in view
    const newFiles = createFilesArray(leafDir, files);
    setCurrentFiles(newFiles);
  }, [files, currentDirChain]);

  return (
    <Paper style={{ height: "100vh" }}>
      {isFetching ? (
        // display progress ring if fetching data
        <div style={{ textAlign: "center", paddingTop: "38px" }}>
          <CircularProgress />
        </div>
      ) : (
        // display file browser
        <FileBrowser
          files={currentFiles}
          folderChain={currentDirChain}
          onFileAction={handleAction}
          defaultFileViewActionId={ChonkyActions.EnableListView.id}
          clearSelectionOnOutsideClick={true}
          iconComponent={FileStatusEmoji}
          fileActions={supportedActions}
        >
          <FileNavbar />
          <FileToolbar />
          <FileList />
        </FileBrowser>
      )}
    </Paper>
  );
};
