import { Eta } from "eta";
import type { EtaConfig } from "eta/dist/types/config";

import { Adapter } from "./abstract.adapter";

export class EtaAdapter implements Adapter {
	constructor(private readonly options: Partial<EtaConfig>) {}

	compile(template: string, data: Record<string, any>): Promise<string> {
		const eta = new Eta(this.options);

		return eta.renderAsync(template, data);
	}
}
