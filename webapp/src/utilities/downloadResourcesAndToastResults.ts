import { QueryStatus } from "@reduxjs/toolkit/dist/query";
import store from "../store/store";
import { syncApi } from "../store/sync-api/";
import { ResourceId } from "../store/sync-api/types";
import resultSnackbar from "./resultSnackbar";

export function downloadResourcesAndToastResults(resources: ResourceId[]) {
  return resources.map((res) => downloadResourceAndToastResult(res));
}

export async function downloadResourceAndToastResult(resource: ResourceId) {
  const okMsg = "Successfully downloaded: ";
  const errMsg = "Failed to download: ";
  const { emitResultMessage } = resultSnackbar(okMsg, errMsg);

  const resultFut = store.dispatch(
    syncApi.endpoints.downloadResource.initiate(resource)
  );
  const result = await resultFut;
  // unsubscribe from cache
  resultFut.unsubscribe();
  const { status } = result;

  emitResultMessage(status === QueryStatus.fulfilled, resource);
}

export default downloadResourcesAndToastResults;
