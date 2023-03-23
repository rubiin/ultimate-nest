import { User } from "@entities";
import { I18nTranslations as I18nTranslationTypes } from "@generated";
import { JoiTypeToInterFace } from "./types";
import { AllEnv } from "@lib/config/configs/allenv";

export {};

declare global {
	namespace Express {
		export interface Request {
			user?: User;
			realIp: string;
		}
	}

	namespace NodeJS {
		interface ProcessEnv extends JoiTypeToInterFace<AllEnv> {}
	}

	export type I18nTranslations = I18nTranslationTypes;
}
