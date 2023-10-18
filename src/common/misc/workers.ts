import { HelperService } from "@common/helpers";
import { ThreadWorker } from "poolifier";

export interface WorkerData<T = string> {
  input: T
}

export interface WorkerResponse<T = string> {
  response: T
}

class FunctionHandlerWorker<
  Data extends WorkerData,
  Response extends WorkerResponse,
> extends ThreadWorker<Data, Response> {
  public constructor() {
    super({
      hashString: async (workerData?: Data) => {
        const hashedString = await HelperService.hashString(JSON.stringify(workerData));
        return { response: hashedString } as Response;
      },
    });
  }
}

export const requestHandlerWorker = new FunctionHandlerWorker<
WorkerData,
WorkerResponse
>();
