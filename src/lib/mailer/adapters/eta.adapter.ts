import type { EtaConfig } from "eta/dist/types/config";

import { Eta } from "eta";
import type { Adapter } from "./abstract.adapter";

// TODO: move the adapters with dynamic import

export class EtaAdapter implements Adapter {
  constructor(private readonly options: Partial<EtaConfig>) {}

  compile(template: string, data: Record<string, any>): Promise<string> {
    const eta = new Eta(this.options);

    return eta.renderAsync(template, data);
  }
}
