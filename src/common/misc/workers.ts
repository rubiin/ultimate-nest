import { ThreadWorker } from "poolifier";
import { HelperService } from "@common/helpers";

enum ThreadFunctions {
  HashString = "hashString",
}

// all expensive process goes here to avoid blocking the main thread
function workerFunction(data: { functionName: string; input: string }) {
  switch (data.functionName) {
    case ThreadFunctions.HashString: {
      return HelperService.hashString(data.input);
    }

    default: {
      throw new Error("Invalid function name");
    }
  }
}

const threadWorker = new ThreadWorker(workerFunction);

export default threadWorker;
