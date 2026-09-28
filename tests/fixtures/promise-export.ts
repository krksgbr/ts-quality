// 01 explicit exported function
export function f1(): Promise<string> { return Promise.resolve("x"); }
// 02 inferred async exported function
export async function f2() { return 1; }
// 03 async exported const arrow
export const f3 = async (x: number) => x;
// 04 explicitly typed Promise arrow
export const f4 = (x: number): Promise<number> => Promise.resolve(x);
// 05 Promise function signature annotation
export const f5: (x: number) => Promise<number> = async x => x;
// 06 exported Promise alias
export type T6 = Promise<number>;
// 07 exported callable type alias
export type T7 = (x: number) => Promise<number>;
// 08 exported interface method
export interface I8 { go(): Promise<void>; }
// 09 exported interface function property
export interface I9 { go: () => Promise<void>; }
// 10 exported async class method
export class C10 { async go() { return 1; } }
// 11 exported class Promise-return method
export class C11 { go(): Promise<number> { return Promise.resolve(1); } }
// 12 non-exported async function
async function private12() { return 1; }
// 13 exported PromiseLike function (near miss)
export function f13(): PromiseLike<number> { return Promise.resolve(1); }
// 14 re-export list of external declaration
const f14 = async () => 1; export { f14 };
// 15 exported const Promise variable value
export const f15: Promise<number> = Promise.resolve(1);
// 16 exported type with inline function-valued property
export type T16 = { go(): Promise<void> };
