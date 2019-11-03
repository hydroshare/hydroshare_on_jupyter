// This file helps integrate the WebSockets connection to the server with the Redux data store.
// It is based off https://medium.com/@ianovenden/redux-websocket-integration-c1a0d22d3189

/*import io from 'socket.io-client';

let _store;
let _socket;

export const WS_EVENT_TYPES = {
  USER_INFO: 'userInfo',
};

export const registerStore = store => {
  _store = store;
};

export const connect = () => {
  _socket = io.connect(window.WEBSOCKET_SERVER_URI, {
    secure: true,
  });
  // Log a message when we've successfully connected to the WebSockets server
  _socket.on('connected', () => console.log('Connected to WebSockets server.'));
  // Set up a listener for each type of message defined above
  Object.keys(WS_EVENT_TYPES).forEach(eventType => _socket.on(WS_EVENT_TYPES[eventType],
    payload => _store.dispatch({ type: WS_EVENT_TYPES[eventType], data: payload })));
};

export const getSocket = () => _socket;

export const emit = (type, payload) => _socket.emit(type, payload);
*/