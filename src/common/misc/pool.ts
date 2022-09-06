import Piscina from "piscina";
import { resolve } from "path";

export const pool = new Piscina({
	filename: resolve(__dirname, "workers.js"),
	idleTimeout: Number.MAX_SAFE_INTEGER,
});
