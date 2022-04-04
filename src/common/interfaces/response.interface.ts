export interface IResponse<T> {
	message: string;
	data: T | Array<T>;
}
