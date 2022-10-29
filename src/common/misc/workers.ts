import {argon2d, hash} from "argon2";
import {ThreadWorker} from "poolifier";

// all expensive process goes here to avoid blocking the main thread

export const hashStringByThread = (value: string): Promise<string> =>
    hash(value, {
        type: argon2d,
        hashLength: 50,
        saltLength: 32,
        timeCost: 4,
    });

function workerFunction(data: { functionName: string; input: any }) {
    if (data.functionName === "hashString") {
        return hashStringByThread(data.input);
    } else {
        throw new Error("function not found");
    }
}

const threadWorker = new ThreadWorker(workerFunction, {async: true});

export default threadWorker;
