export type ObjPathProxy<TRoot, T> = {
  [P in keyof T]: ObjPathProxy<TRoot, T[P]>;
};

const pathSymbol = Symbol('Object path');

export class ObjectPathProxy {
  static create<T>(path: string[] = []): ObjPathProxy<T, T> {
    const proxy = new Proxy({[pathSymbol]: path}, {
      get (target, key) {
        return key === pathSymbol
          ? target[pathSymbol]
          : ObjectPathProxy.create([...(path || []), key.toString()]);
      }
    });
    return proxy as any as ObjPathProxy<T, T>;
  }

  static getPath<TRoot, T>(obj: ObjPathProxy<TRoot, T>): string[] {
    return (obj as any)[pathSymbol];
  }

  static isProxy<TRoot, T>(value: any): value is ObjPathProxy<TRoot, T> {
    return value && typeof value === 'object' && !!ObjectPathProxy.getPath<TRoot, T>(value as ObjPathProxy<TRoot, T>);
  }
}
