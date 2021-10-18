import { resourceUpdate, fsUpdate } from "../store/actions";
import store from "../store/store";
import { getBaseUrl } from "../utilities/getJupyterConfigData";

/* constants */
const BASE_URL = await getBaseUrl();
// toggle between wss and ws depending on if the current protocol is https
const WS_PROTOCOL = window.location.protocol.includes("s") ? "wss://" : "ws://";
const WS_URI = `${BASE_URL}syncApi/ws`;
const HOSTNAME = window.location.hostname;
const PORT = window.location.port;
const WS_URL = `${WS_PROTOCOL}${HOSTNAME}:${PORT}${WS_URI}`;

export const fileSystemWebSocket = (): WebSocket => {
  const ws = new WebSocket(WS_URL);
  let haveReceived: boolean = false;

  ws.onopen = (event) => {};

  ws.onclose = (event) => {
    haveReceived = false;

    // TODO: remove in the future
    console.log("websocket closed");
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    !haveReceived
      ? // add all resources object
        store.dispatch(resourceUpdate(data))
      : // update resource
        store.dispatch(fsUpdate(data));

    haveReceived = true;
    console.log("data:", data);
  };

  return ws;
};

export default fileSystemWebSocket;
