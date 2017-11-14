import { ObjectPathProxy } from "../src/object-path-proxy"
import {} from 'jasmine';

interface ITest {
  one: number;
  two: string;
  three: INestedTest;
}

interface INestedTest {
  firrst: number;
  second: string;
}

/**
 * Dummy test
 */
describe("ObjectPathProxy.create test", () => {
  it("Creates proxy", () => {
    const p = ObjectPathProxy.create<ITest>();
    expect(p).toBeTruthy()
  })
})

describe("ObjectPathProxy.getPath test", () => {
  it("Creates proxy with empty path", () => {
    const p = ObjectPathProxy.create<ITest>();
    expect(ObjectPathProxy.getPath(p)).toEqual([]);
  })
  it("Gets path from proxy", () => {
    const p = ObjectPathProxy.create<ITest>();
    expect(ObjectPathProxy.getPath(p.one)).toEqual(['one']);
    expect(ObjectPathProxy.getPath(p.three.second)).toEqual(['three', 'second']);
  })
  it("Gets path from proxy", () => {
    expect(ObjectPathProxy.getPath({})).toBeUndefined();
  })
})


describe("ObjectPathProxy.isProxy test", () => {
  it("Returns true for proxies", () => {
    const p = ObjectPathProxy.create<ITest>();
    expect(ObjectPathProxy.isProxy(p)).toBeTruthy();
    expect(ObjectPathProxy.isProxy(p.three.firrst)).toBeTruthy();
  })
  it("Returns false for not proxies", () => {
    const p: any = {};
    expect(ObjectPathProxy.isProxy(p)).toBeFalsy();
    expect(ObjectPathProxy.isProxy(p.three)).toBeFalsy();
    expect(ObjectPathProxy.isProxy(undefined)).toBeFalsy();
    expect(ObjectPathProxy.isProxy(false)).toBeFalsy();
    expect(ObjectPathProxy.isProxy(7)).toBeFalsy();
    expect(ObjectPathProxy.isProxy('test')).toBeFalsy();
  })
})
