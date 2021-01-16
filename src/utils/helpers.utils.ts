export const isObjectEmpty = (obj: unknown): boolean => {
  return Object.keys(obj).length === 0;
};


export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const ret: any = {};

  keys.forEach(key => {
    ret[key] = obj[key];
  });

  return ret;
}