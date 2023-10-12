import { ThreadWorker } from "poolifier";
import { HelperService } from "@common/helpers";
import { ThreadFunctions } from "@common/@types";

// all expensive process goes here to avoid blocking the main thread
function workerFunction(data: { functionName: string; input: string }) {
  switch (data.functionName) {
    case ThreadFunctions.HASH_STRING: {
      return HelperService.hashString(data.input);
    }

    default: {
      throw new Error(`Invalid thread function name, available are ${Object.keys(ThreadFunctions).join(" ,")}`);
    }
  }
}

const threadWorker = new ThreadWorker(workerFunction as any);

export default threadWorker;
