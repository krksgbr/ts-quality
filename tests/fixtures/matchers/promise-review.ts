export default class DefaultClass {
  async run() {}
  load(): Promise<void> { return Promise.resolve(); }
  async *values() { yield 1; }
}
export async function* generator() { yield 1; }
export class NamedClass {
  async *values() { yield 1; }
}
export async function genericAsync<T>() {}
export function genericPromise<T>(): Promise<T> { return null as T; }
export type GenericPromise<T> = Promise<T>;
export type GenericFunction<T> = () => Promise<T>;
