/**
 * This is a test of the react-beautiful-dnd package. It should be restructured significantly if it is to be used.
 * Tutorial illustrating how to customize appearing during a drag:
 * https://egghead.io/lessons/react-customise-the-appearance-of-an-app-during-a-drag-using-react-beautiful-dnd-snapshot-values
 */

// TODO: add documentation
import * as React from "react";
import { ChangeEvent } from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { AiFillDelete } from "react-icons/ai";
import { MdCreateNewFolder } from "react-icons/md";
import { FiRefreshCcw } from "react-icons/fi";
import { RiDownload2Line } from "react-icons/ri";
import { RiUpload2Line } from "react-icons/ri";
import "../styles/FileManager.scss";
import {
  FileOrFolderTypes,
  IFile,
  IFolder,
  IResource,
  IResourceFilesData,
  IRootState,
} from "../store/types";

import FilePane from "./FilePane";
import { ThunkDispatch, ThunkAction } from "redux-thunk";
import { getResourceLocalFiles } from "../store/async-actions";
import * as resourcesActions from "../store/actions/resources";

interface IFileManagerState {
  filterByName: string;
  selectedLocalFilesAndFolders: Set<string>;
  selectedHydroShareFilesAndFolders: Set<string>;
}

interface IFileManagerProps {
  fetchingHydroShareFiles: boolean;
  fetchingLocalFiles: boolean;
  hydroShareResourceRootDir: IFolder;
  localFilesRootDir: IFolder;
  copyFileOrFolder: (src: IFile, dest: IFolder) => any;
  moveFileOrFolder: (src: IFile, dest: IFolder) => any;
  openFile: (file: IFile) => any;
  promptCreateNewFileOrFolder: () => any;
  promptDeleteFilesOrFolders: (paths: string[]) => any;
  promptUploadFile: () => any;
  promptRenameFileOrFolderWorkspace: (fileOrFolder: IFile | IFolder) => any;
  promptRenameFileOrFolderHydroShare: (fileOrFolder: IFile | IFolder) => any;
  resourceId: string;
  downloadFileOrFolder: (paths: string[]) => any;
  checkSyncStatus: (paths: string[]) => any;
  checkSyncHydroShare: (paths: string[]) => any;
}

// For converting file paths back into IFiles and IFolders
let fileOrFolderLookupTable = new Map<string, IFile | IFolder>();

// @ts-ignore
const ASSETS_URL = (window.FRONTEND_URL || "") + "/assets";

/**
 * Parent component that contains the actions bar and the file panes. It contains both the
 * workspace file pane and the HydroShare file pane
 */
export default class FileManager extends React.Component<
  IFileManagerProps,
  IFileManagerState
> {
  state = {
    allHydroShareFilesAndFoldersSelected: false,
    allLocalFilesAndFoldersSelected: false,
    filterByName: "",
    selectedLocalFilesAndFolders: new Set<string>(),
    selectedHydroShareFilesAndFolders: new Set<string>(),
  };

  onDragEnd = (result: DropResult) => {
    const { draggableId: srcURI, destination: dest } = result;
    if (!dest?.droppableId) {
      // Not sure when this happens, but droppableId is apparently optional
      return;
    }
    const destURI = dest.droppableId;
    const srcFileOrFolder = fileOrFolderLookupTable.get(srcURI) as
      | IFile
      | IFolder;
    const destFolder = fileOrFolderLookupTable.get(destURI) as IFolder;
    const srcPrefix = srcURI.split(":")[0];
    const destPrefix = destURI.split(":")[0];
    const srcParentFolderPathComponents = srcFileOrFolder.path.split("/");
    srcParentFolderPathComponents.pop();
    let srcParentFolderPath = srcParentFolderPathComponents.join("/");
    if (srcParentFolderPathComponents.length === 1) {
      // Length is 1 if parent folder is root dir
      srcParentFolderPath += "/";
    }
    if (srcParentFolderPath === destFolder.path) {
      // File dropped in its current directory
      return;
    }
    if (srcPrefix === destPrefix) {
      // Move files within HydroShare or the local filesystem
      this.props.moveFileOrFolder(srcFileOrFolder, destFolder);
    } else {
      // Copy files between HydroShare and the local filesystem
      this.props.copyFileOrFolder(srcFileOrFolder, destFolder);
    }
  };

  filterByNameChanged = (e: ChangeEvent<HTMLInputElement>) =>
    this.setState({ filterByName: e.target.value });

  buildLookupTable = () => {
    fileOrFolderLookupTable.clear();

    if (this.props.localFilesRootDir) {
      fileOrFolderLookupTable.set(
        this.props.localFilesRootDir.path,
        this.props.localFilesRootDir
      );
      this.addFolderContentsToLookupTable(this.props.localFilesRootDir);
    }
    if (this.props.hydroShareResourceRootDir) {
      fileOrFolderLookupTable.set(
        this.props.hydroShareResourceRootDir.path,
        this.props.hydroShareResourceRootDir
      );
      this.addFolderContentsToLookupTable(this.props.hydroShareResourceRootDir);
    }
  };

  addFolderContentsToLookupTable = (folder: IFolder) => {
    folder.contents.forEach((item) => {
      fileOrFolderLookupTable.set(item.path, item);
      if (item.type === FileOrFolderTypes.FOLDER) {
        this.addFolderContentsToLookupTable(item as IFolder);
      }
    });
  };

  setSelectedHydroShareFilesAndFolders = (items: Set<string>): void =>
    this.setState({ selectedHydroShareFilesAndFolders: items });
  setSelectedLocalFilesAndFolders = (items: Set<string>): void =>
    this.setState({ selectedLocalFilesAndFolders: items });

  promptDeleteSelectedHydroShareFiles = () => {
    // This would ideally be done when we get a new list of file from the server, but since the only way to do that
    // would be to filter on a re-render, this is probably the fastest approach (though definitely not the cleanest)
    const selectedItems = this.removeInvalidChoicesFromSelectedSet(
      this.props.hydroShareResourceRootDir,
      this.state.selectedHydroShareFilesAndFolders
    );
    this.props.promptDeleteFilesOrFolders(selectedItems);
  };

  promptSelectedHydroShareFiles = () => {
    const selectedItems = this.removeInvalidChoicesFromSelectedSet(
      this.props.hydroShareResourceRootDir,
      this.state.selectedHydroShareFilesAndFolders
    );
    this.props.downloadFileOrFolder(selectedItems);
  };
  promptCheckSyncStatusFiles = () => {
    const selectedItems = this.removeInvalidChoicesFromSelectedSet(
      this.props.localFilesRootDir,
      this.state.selectedLocalFilesAndFolders
    );
    const hydroshareSelectedItems = this.removeInvalidChoicesFromSelectedSet(
      this.props.hydroShareResourceRootDir,
      this.state.selectedHydroShareFilesAndFolders
    );
    this.props.checkSyncHydroShare(hydroshareSelectedItems);
    this.props.checkSyncStatus(selectedItems);
  };

  promptDeleteSelectedLocalFiles = () => {
    // This would ideally be done when we get a new list of file from the server, but since the only way to do that
    // would be to filter on a re-render, this is probably the fastest approach (though definitely not the cleanest)
    const selectedItems = this.removeInvalidChoicesFromSelectedSet(
      this.props.localFilesRootDir,
      this.state.selectedLocalFilesAndFolders
    );
    this.props.promptDeleteFilesOrFolders(selectedItems);
  };

  removeInvalidChoicesFromSelectedSet = (
    folder: IFolder,
    selectedSet: Set<string>
  ) => {
    const validChoices = this.getFlatListOfFolderContents(folder);
    return validChoices.filter((c) => selectedSet.has(c));
  };

  getFlatListOfFolderContents = (folder: IFolder): string[] => {
    let list: string[] = [];
    folder.contents.forEach((f) => {
      list.push(f.path);
      if (f.type === FileOrFolderTypes.FOLDER) {
        this.getFlatListOfFolderContents(f as IFolder).forEach((childPath) =>
          list.push(childPath)
        );
      }
    });
    return list;
  };

  render() {
    const {
      hydroShareResourceRootDir,
      localFilesRootDir,
      fetchingLocalFiles,
      fetchingHydroShareFiles,
      openFile,
    } = this.props;

    const { filterByName } = this.state;

    // Rebuild the lookup table
    this.buildLookupTable();

    const localFilesDeleteClassName =
      this.state.selectedLocalFilesAndFolders.size === 0
        ? "button-disabled button-down"
        : "button-enabled button-down";
    const localFilesHeader = (
      <div>
        <div className="title-row">
          <span className="title">Workspace Files</span>
          <img
            src={ASSETS_URL + "/JupyterHub-logo.png"}
            alt="JupyterHub logo"
          />
        </div>
        <div className="actions-row local">
          <input
            className="search"
            onChange={this.filterByNameChanged}
            placeholder="Filter"
            title="Filter the files and folders by name"
            type="text"
            value={filterByName}
          />
          <MdCreateNewFolder
            cursor="pointer"
            title="Create a file or a folder"
            style={{ width: 40, height: 30, backgroundColor: "transparent" }}
            className={localFilesDeleteClassName}
            onClick={this.props.promptCreateNewFileOrFolder}
          ></MdCreateNewFolder>
          <RiUpload2Line
            cursor="pointer"
            title="Upload file from local system to workspace"
            style={{ width: 40, height: 30, backgroundColor: "transparent" }}
            className={localFilesDeleteClassName}
            onClick={this.props.promptUploadFile}
          ></RiUpload2Line>
          <AiFillDelete
            cursor="pointer"
            style={{ width: 40, height: 30 }}
            className={localFilesDeleteClassName}
            onClick={this.promptDeleteSelectedLocalFiles}
            title="Delete the selected files and/or folders"
          />
          <FiRefreshCcw
            cursor="pointer"
            style={{ width: 40, height: 30, backgroundColor: "transparent" }}
            className={localFilesDeleteClassName}
            onClick={this.promptCheckSyncStatusFiles}
            title="Checks the sync status"
          ></FiRefreshCcw>
        </div>
      </div>
    );

    const hydroShareDeleteClassName =
      this.state.selectedHydroShareFilesAndFolders.size === 0
        ? "button-disabled button-down"
        : "button-enabled button-down";
    const openInHydroShare = () =>
      window.open(
        `https://www.hydroshare.org/resource/${this.props.resourceId}/`,
        "_blank"
      );
    const hydroShareHeader = (
      <div>
        <div className="title-row">
          <span className="title">HydroShare Files</span>
          <img
            src={ASSETS_URL + "/HydroShare-logo.png"}
            alt="HydroShare logo"
          />
        </div>
        <div className="actions-row">
          <input
            className="search"
            onChange={this.filterByNameChanged}
            placeholder="Filter"
            title="Filter the files and folders by name"
            type="text"
            value={filterByName}
          />
          <RiDownload2Line
            cursor="pointer"
            style={{ width: 40, height: 30 }}
            className={hydroShareDeleteClassName}
            onClick={this.promptSelectedHydroShareFiles}
            title="Download the files from HydroShare to Workspace"
          ></RiDownload2Line>
          <AiFillDelete
            cursor="pointer"
            style={{ width: 40, height: 30 }}
            className={hydroShareDeleteClassName}
            onClick={this.promptDeleteSelectedHydroShareFiles}
            title="Delete the selected files and/or folders"
          ></AiFillDelete>
          <FiRefreshCcw
            style={{ width: 40, height: 30, backgroundColor: "transparent" }}
            cursor="pointer"
            className={hydroShareDeleteClassName}
            onClick={this.promptCheckSyncStatusFiles}
            title="Checks the sync status"
          ></FiRefreshCcw>
        </div>
      </div>
    );

    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <div className="FileManager content-row">
          <FilePane
            resourceId={this.props.resourceId}
            className="tile hydroshare"
            droppableId={hydroShareResourceRootDir?.path || "loading"}
            filterByName={filterByName}
            loading={fetchingHydroShareFiles}
            rootDir={hydroShareResourceRootDir}
            header={hydroShareHeader}
            openFile={openInHydroShare}
            promptRenameFile={this.props.promptRenameFileOrFolderHydroShare}
            fileLocation={"HydroShare"}
            onSelectedFilesAndFoldersChange={
              this.setSelectedHydroShareFilesAndFolders
            }
          />
          <FilePane
            resourceId={this.props.resourceId}
            className="tile jupyterhub"
            droppableId={localFilesRootDir?.path || "loading"}
            filterByName={filterByName}
            loading={fetchingLocalFiles}
            rootDir={localFilesRootDir}
            header={localFilesHeader}
            openFile={openFile}
            promptRenameFile={this.props.promptRenameFileOrFolderWorkspace}
            fileLocation={"Workspace"}
            onSelectedFilesAndFoldersChange={
              this.setSelectedLocalFilesAndFolders
            }
          />
        </div>
      </DragDropContext>
    );
  }
}
