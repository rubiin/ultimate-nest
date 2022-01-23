export interface IRoute {
  params: Record<string, any>;
  query: Record<string, any>;
  path: string;
  name: string;
}
