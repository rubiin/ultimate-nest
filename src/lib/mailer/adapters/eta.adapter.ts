import { renderFile, config } from "eta";

import { IAdapter } from "./abstract.adapter";

export class EtaAdapter implements IAdapter {
	constructor(private readonly options: Partial<typeof config>) {}

	compile(template: string, data: Record<string, any>): Promise<string> {
		return renderFile(template, data, this.options) as Promise<string>;
	}
}
