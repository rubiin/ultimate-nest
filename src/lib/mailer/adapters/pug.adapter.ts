import pug from "pug";

import { IAdapter } from "./abstract.adapter";

export class PugAdapter implements IAdapter {
	constructor(private readonly options: Partial<pug.Options>) {}

	compile(template: string, data: Record<string, any>): string {
		return pug.compileFile(template, this.options)(data);
	}
}
