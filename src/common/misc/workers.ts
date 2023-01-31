import { HelperService } from "@common/helpers";
import { ThreadWorker } from "poolifier";

const enum ThreadFunctions {
	HashString = "hashString",
}

// all expensive process goes here to avoid blocking the main thread
const workerFunction = (data: { functionName: string; input: string }) => {
	if (data.functionName === ThreadFunctions.HashString) {
		return HelperService.hashString(data.input);
	} else {
		throw new Error("function not found");
	}
};

const threadWorker = new ThreadWorker(workerFunction, { async: true });

export default threadWorker;
