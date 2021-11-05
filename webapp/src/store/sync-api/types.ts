type ResourceFilePrefix = "/data/contents/";

// export type TResourceFile<
//   P extends ResourceFilePrefix,
//   F extends string
// > = `${P}${F}`;
export type TResourceFile = string;

export type AuthState = {
  status: boolean;
};

export type ResourceId = string;

export type FSState = {
  resource_id: ResourceId;
  only_local: string[];
  only_remote: string[];
  out_of_sync: string[];
  in_sync: string[];
};

export type ResourceState = {
  [Property in keyof ResourceId]?: FSState;
};
