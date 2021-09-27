import { resourceUpdate, fsUpdate } from "../store/actions";
import store from "../store/store";
const WS_PROTOCOL = "ws://";
const WS_URI = "/syncApi/ws";
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
