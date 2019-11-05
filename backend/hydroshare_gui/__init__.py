import socket
from get_info import get_metadata

HOST = '127.0.0.1'
PORT = 1025

def _jupyter_server_extension_paths():
    return [{
        "module": "hydroshare_gui"
    }]


def load_jupyter_server_extension(nbapp):
    nbapp.log.info("CUAHSI module enabled!")

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((HOST, PORT))
        s.listen()
        print("listening...")
        conn, addr = s.accept()
        with conn:
            print('Connected by', addr)
            while True:
                # data = conn.recv(1024)
                test_resource_id = '8b826c43f55043f583c85ae312a8894f'
                data = get_metadata(test_resource_id)['resource_title']
                print(data)
                if not data:
                    break
                conn.sendall(data.encode('utf-8'))
                break
