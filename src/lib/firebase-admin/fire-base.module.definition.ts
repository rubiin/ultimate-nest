import { ConfigurableModuleBuilder } from "@nestjs/common";

export interface FirebaseModuleOptions {
  credentialPath: string
  databaseUrl: string
}

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN }
    = new ConfigurableModuleBuilder<FirebaseModuleOptions>({
      moduleName: "FirebaseModule",
    })
      .setExtras(
        {
          isGlobal: true,
        },
        (definition, extras) => ({
          ...definition,
          global: extras.isGlobal,
        }),
      )
      .setClassMethodName("forRoot")
      .build();
