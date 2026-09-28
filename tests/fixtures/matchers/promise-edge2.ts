export const first = 1, later = async (x:number) => x;
export const firstAsync = async (x:number) => x, following = 1;
export const multi: (x:number) => Promise<number> = async x=>x, next=1;
export class C { private async privateRun(){} public async publicRun(){} protected run():Promise<void>{return Promise.resolve()} static run():Promise<void>{return Promise.resolve()} }
export interface I { optional?(): Promise<void>; readonly fn: () => Promise<void>; fn2?: () => Promise<void>; }
export const explicit = async x => x;
export const parens = (async (x: number) => x);
export const body = (x:number):Promise<number> => Promise.resolve(x);
export const bodyParens = ((x:number):Promise<number> => Promise.resolve(x));
