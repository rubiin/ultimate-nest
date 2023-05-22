import { compile } from "handlebars";

import { Adapter } from "./abstract.adapter";

export class HandlebarsAdapter implements Adapter {
	constructor(private readonly options: Partial<CompileOptions>) {}

	compile(template: string, data: Record<string, any>): Promise<string> {
		const compiledTemplate = compile(template, this.options);

		return Promise.resolve(compiledTemplate(data));
	}
}
