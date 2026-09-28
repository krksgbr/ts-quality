export class C1 { async go() {} }
export class C2 { static async go() {} }
export class C3 { public async go() {} }
export class C4 { private async go() {} }
export class C5 { protected go(): Promise<void> {return Promise.resolve()} }
export class C6 { static go(): Promise<void> {return Promise.resolve()} }
export class C7 { go(): Promise<void> {return Promise.resolve()} }
export class C8 { async go(): Promise<void> {return Promise.resolve()} }
export interface I1 { go(): Promise<void> }
export interface I2 { go?(): Promise<void> }
export interface I3 { readonly go: ()=>Promise<void> }
export interface I4 { go?: ()=>Promise<void> }
export interface I5 { go: ()=>Promise<void> }
