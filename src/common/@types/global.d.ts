import { User } from "@entities";
import { I18nTranslations as I18nTranslationTypes } from "@generated";
import { AllEnvironment } from "@lib/config/configs/allenv";

import { JoiTypeToInterFace } from "./types";

export {};

declare global {
	namespace Express {
		export interface Request {
			user?: User;
			realIp: string;
		}
	}

	namespace NodeJS {
		type ProcessEnv = JoiTypeToInterFace<AllEnvironment>
	}

	export type I18nTranslations = I18nTranslationTypes;
}
