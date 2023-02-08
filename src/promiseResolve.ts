export class PromiseResolve <T, Err> {
    constructor(public resolve: (foo: T | PromiseLike<T>) => void, public reject: (err: Err | PromiseLike<Err>) => void) {}
}