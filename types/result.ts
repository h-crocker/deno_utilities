export type SuccessfulResult<T> = {
    value: T;
    error: undefined;
}

export type UnsuccessfulResult = {
    value: undefined | null;
    error: Error;
}

export type Result<T> = SuccessfulResult<T> | UnsuccessfulResult;
