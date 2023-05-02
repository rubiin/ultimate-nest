import { HelperService } from "@common/helpers";
import { ThreadWorker } from "poolifier";

const enum ThreadFunctions {
	HashString = "hashString",
}

// all expensive process goes here to avoid blocking the main thread
const workerFunction = (data: { functionName: string; input: string }) => {
	switch (data.functionName) {
		case ThreadFunctions.HashString: {
			return HelperService.hashString(data.input);
		}

		default: {
			throw new Error("Invalid function name");
		}
	}
};

const threadWorker = new ThreadWorker(workerFunction, { async: true });

export default threadWorker;
