import * as eta from "eta";
import type { Options as PugOptions } from "pug";
import pug from "pug";

export interface IAdapter {
	compile(template: string, options: any): Promise<string> | string;
}

export class EtaAdapter implements IAdapter {
	constructor(private readonly options: Partial<typeof eta.config>) {}

	compile(template: string, data: any): Promise<string> {
		return eta.renderFile(template, data, this.options) as Promise<string>;
	}
}

export class PugAdapter implements IAdapter {
	constructor(private readonly options: Partial<PugOptions>) {}

	compile(template: string, data: any): string {
		return pug.compileFile(template, this.options)(data);
	}
}
