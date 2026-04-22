declare module "nestjs-minio" {
  import { DynamicModule, ModuleMetadata } from "@nestjs/common";
  import { Client, ClientOptions } from "minio";

  interface NestMinioAsyncOptions extends Pick<ModuleMetadata, "imports"> {
    isGlobal?: boolean;
    inject?: any[];
    useFactory?: (...args: any[]) => Promise<ClientOptions> | ClientOptions;
  }

  class NestMinioModule {
    static register(options: ClientOptions & { isGlobal?: boolean }): DynamicModule;
    static registerAsync(options: NestMinioAsyncOptions): DynamicModule;
  }

  class NestMinioService {
    readonly client: Client;
  }

  export { NestMinioModule, NestMinioService };
}
