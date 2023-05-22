import pug from "pug";

import { Adapter } from "./abstract.adapter";

export class PugAdapter implements Adapter {
	constructor(private readonly options: Partial<pug.Options>) {}

	compile(template: string, data: Record<string, any>): string {
		return pug.compileFile(template, this.options)(data);
	}
}
