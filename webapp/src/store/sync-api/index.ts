import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import getCookie from "../../utilities/getCookie";
import {
  ISuccess,
  ICredentials,
  IResourceMetadata,
  IUserInfo,
  IResourceFiles,
  IResourceFilesRequest,
  IResourceFileDownloadRequest,
  IDataDirectory,
} from "./interfaces";

const BACKEND_PREFIX = "syncApi";

export const syncApi = createApi({
  reducerPath: "syncApi",
  baseQuery: fetchBaseQuery({ baseUrl: `/${BACKEND_PREFIX}/` }),
  tagTypes: ["EndSession", "Resource"],
  endpoints: (build) => ({
    // log user in
    login: build.mutation<ISuccess, ICredentials>({
      query: (creds) => ({
        url: `login`,
        params: { _xsrf: getCookie("_xsrf") },
        method: "POST",
        body: creds,
      }),
      // invalidate all tags
      invalidatesTags: ["EndSession", "Resource"],
    }),
    // log user out
    logout: build.mutation<void, void>({
      query: () => ({
        url: `login`,
        params: { _xsrf: getCookie("_xsrf") },
        method: "DELETE",
        headers: { "content-type": "application/json" },
      }),
      // invalidate all tags
      invalidatesTags: ["EndSession", "Resource"],
    }),
    // get data directory (i.e. where hydroshare resources are stored locally)
    dataDirectory: build.query<IDataDirectory, void>({
      query: () => "data_directory",
    }),
    // get user info
    userInfo: build.query<IUserInfo, void>({
      query: () => "user",
      providesTags: ["EndSession"],
    }),
    // list resources user can edit
    listUserHydroShareResources: build.query<IResourceMetadata[], void>({
      query: () => "resources",
      // @ts-ignore
      providesTags: (result, error) =>
        // if successful request, add to Resource IDed by it's HS resource id.
        result
          ? [
              ...result.map(
                ({ resource_id }) =>
                  ({
                    type: "Resource",
                    id: resource_id,
                  } as const)
              ),
              { type: "EndSession" },
            ]
          : [{ type: "EndSession" }],
    }),
    // list files in a resource the user can edit
    listHydroShareResourceFiles: build.query<IResourceFiles, string>({
      query: (resource_id) => `resources/${resource_id}`,
      providesTags: (result, error, resource_id) =>
        result
          ? ([
              { type: "Resource", id: resource_id },
              { type: "EndSession" },
            ] as const)
          : [{ type: "EndSession" }],
    }),
    // download a resource to the local fs from HydroShare
    downloadResource: build.query<void, string>({
      query: (resource_id) => `resources/${resource_id}/download`,
      providesTags: ["EndSession"],
    }),
    // download a file or folder to the local fs from HydroShare
    downloadResourceEntity: build.query<void, IResourceFileDownloadRequest>({
      query: ({ resource_id, file }) =>
        `resources/${resource_id}/download/${file}`,
      providesTags: ["EndSession"],
    }),
    // upload a file or folder from the local fs to HydroShare
    uploadResourceEntity: build.mutation<void, IResourceFilesRequest>({
      query: ({ resource_id, files }) => ({
        url: `resources/${resource_id}/upload`,
        params: { _xsrf: getCookie("_xsrf") },
        method: "POST",
        body: { files: files },
      }),
      invalidatesTags: (result, error, { resource_id }) =>
        // invalidate listed resources after an upload
        result ? [{ type: "Resource", id: resource_id } as const] : [],
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useDataDirectoryQuery,
  useUserInfoQuery,
  useListHydroShareResourceFilesQuery,
  useListUserHydroShareResourcesQuery,
  useDownloadResourceQuery,
  useDownloadResourceEntityQuery,
  useUploadResourceEntityMutation,
} = syncApi;

export default syncApi;
