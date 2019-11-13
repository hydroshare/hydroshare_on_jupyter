import hs_restclient
from login import username, password

a = hs_restclient.HydroShareAuthBasic(username=username,
                                      password=password)
hs = hs_restclient.HydroShare(auth=a)
hs.resources()