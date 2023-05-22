export interface Adapter {
	compile(template: string, data: Record<string, any>): Promise<string> | string;
}
