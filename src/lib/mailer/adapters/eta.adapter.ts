import { renderFile } from "eta";
import type { EtaConfig } from "eta/dist/types/config";

import { Adapter } from "./abstract.adapter";

export class EtaAdapter implements Adapter {
	constructor(private readonly options: Partial<EtaConfig>) {

  }

	compile(template: string, data: Record<string, any>): Promise<string> {
		return renderFile(template, data, this.options);
	}
}
