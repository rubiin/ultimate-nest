import {name, } from "../../../package.json";

export const APP_NAME = name;

export const THROTTLE_LIMIT_RESPONSE = "Too many requests, please try again later.";
export const MULTER_IMAGE_FILTER = "Only image files are allowed!.";
export const API_UNAUTHORISED_RESPONSE = "No auth token.";
export const REQUEST_ID_TOKEN_HEADER = "x-request-id";

// metadata constants
export const IGNORE_CACHING_META = "ignoreCaching";
export const IS_PUBLIC_KEY_META = "isPublic";
export const CHECK_POLICIES_KEY_META = "checkPolicy";


// swagger constants
export const SWAGGER_TITLE = `${APP_NAME} API Documentation`;


export const SWAGGER_API_ENDPOINT = "doc";

export {version as SWAGGER_API_CURRENT_VERSION,description as SWAGGER_DESCRIPTION} from "../../../package.json";