export interface IAdapter {
	compile(template: string, data: Record<string, any>): Promise<string> | string;
}
