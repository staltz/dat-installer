export type AppMetadata = {
  key: string;
  package?: string | undefined;
  version?: string | undefined;
  label?: string | undefined;
  readme?: string | undefined;
  apkFullPath?: string | undefined;
  peers: number;
};
