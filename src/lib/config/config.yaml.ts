import { readFileSync } from "fs";
import * as yaml from "js-yaml";
import { join } from "path";

const YAML_CONFIG_FILENAME = "prod.yaml";

export default () => {
	const yml = yaml.load(
		readFileSync(join("yaml", YAML_CONFIG_FILENAME), "utf8"),
	) as Record<string, any>;

	console.info(yml);

	return yml;
};
