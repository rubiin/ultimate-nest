import * as eta from "eta";

import { IAdapter } from "./abstract.adapter";

export class EtaAdapter implements IAdapter {
	constructor(private readonly options: Partial<typeof eta.config>) {}

	compile(template: string, data: Record<string, any>): Promise<string> {
		return eta.renderFile(template, data, this.options) as Promise<string>;
	}
}
