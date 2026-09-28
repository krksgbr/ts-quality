export const plain = async x => x;
export const paren = (async (x: number) => x);
export const dual = async (x: number) => x, other = 1;
export function typed(): Promise<number> {return Promise.resolve(1)}
export function nested(): Promise<Promise<number>> {return Promise.resolve(Promise.resolve(1))}
export function noGeneric(): Promise {return Promise.resolve(1)}
export type Alias = PromiseLike<number>;
export type Union = Promise<number> | null;
export type Callable = (x:number) => (Promise<number>);
export interface I { other?(): Promise<string>; get(): Promise<number>; }
export class C { static async run() {} private async other() {} }
export default async function d() {}
const f = async () => {}; export { f };
export const wrapped: (() => Promise<void>) = () => Promise.resolve();
