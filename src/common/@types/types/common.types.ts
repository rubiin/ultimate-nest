import type { File } from "@common/@types";
import type { EntityDTO, FromEntityType, RequiredEntityData } from "@mikro-orm/postgresql";

export type Optional<T> = T | undefined;
export type Nullable<T> = T | null;

// This type represents a dto that contains a file or files
export type RecordWithFile<T, K = File> = T & {
  files: K
};

export type UpdateEntityType<Entity> = Partial<EntityDTO<FromEntityType<Entity>>>;
export type CreateEntityType<Entity> = RequiredEntityData<Entity>;
