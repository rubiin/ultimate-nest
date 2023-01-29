import { HelperService } from "@common/helpers";
import { ThreadWorker } from "poolifier";

// all expensive process goes here to avoid blocking the main thread


const workerFunction = (data: { functionName: string; input: string }) => {
	if (data.functionName === "hashString") {
		return HelperService.hashString(data.input);
	} else {
		throw new Error("function not found");
	}
};

const threadWorker = new ThreadWorker(workerFunction, { async: true });

export default threadWorker;
