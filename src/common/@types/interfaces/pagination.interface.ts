export interface IPageInfo {
	endCursor: string;
	startCursor: string;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

export interface IEdge<T> {
	cursor: string;
	node: T;
}

export interface IPaginated<T> {
	previousCount: number;
	currentCount: number;
	edges: IEdge<T>[];
	pageInfo: IPageInfo;
}
