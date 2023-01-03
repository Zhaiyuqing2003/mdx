import { Some, None, Option } from "./option"

export class Result<T, E> {
    private value : [ResultType.Ok, NonNullable<T>] | [ResultType.Err, NonNullable<E>];
    private constructor(value : [ResultType.Ok, NonNullable<T>] | [ResultType.Err, NonNullable<E>]) {
        this.value = value;
    }

    public static Ok<T, E>(value: NonNullable<T>): Result<T, E> {
        return new Result<T, E>([ResultType.Ok, value]);
    }

    public static Err<T, E>(value: NonNullable<E>): Result<T, E> {
        return new Result<T, E>([ResultType.Err, value]);
    }

    public isOk(): boolean {
        return this.value[0] === ResultType.Ok;
    }

    public isErr(): boolean {
        return this.value[0] === ResultType.Err;
    }

    public err() : Option<E> {
        return this.value[0] === ResultType.Err ? Some(this.value[1]) : None;
    }

    public ok() : Option<T> {
        return this.value[0] === ResultType.Ok ? Some(this.value[1]) : None;
    }

    public unwrap(): NonNullable<T> {
        if (this.value[0] === ResultType.Ok) {
            return this.value[1];
        }
        throw new Error('Result is Err');
    }

    public expect(message: string): NonNullable<T> {
        if (this.value[0] === ResultType.Ok) {
            return this.value[1];
        }
        throw new Error(message);
    }

    public unwrapOr(defaultValue: NonNullable<T>): NonNullable<T> {
        return this.value[0] === ResultType.Ok ? this.value[1] : defaultValue;
    }

    public unwrapOrElse(fn: () => NonNullable<T>): NonNullable<T> {
        return this.value[0] === ResultType.Ok ? this.value[1] : fn();
    }

    public unwrapErr(): NonNullable<E> {
        if (this.value[0] === ResultType.Err) {
            return this.value[1];
        }
        throw new Error('Result is Ok');
    }

    public expectErr(message: string): NonNullable<E> {
        if (this.value[0] === ResultType.Err) {
            return this.value[1];
        }
        throw new Error(message);
    }

    public map<U>(fn: (value: NonNullable<T>) => NonNullable<U>): Result<U, E> {
        return this.value[0] === ResultType.Ok ? Ok(fn(this.value[1])) : Err(this.value[1]);
    }

    public mapOr<U>(defaultValue: NonNullable<U>, fn: (value: NonNullable<T>) => NonNullable<U>): NonNullable<U> {
        return this.value[0] === ResultType.Ok ? fn(this.value[1]) : defaultValue;
    }

    public mapOrElse<U>(defaultValue: () => NonNullable<U>, fn: (value : NonNullable<T>) => NonNullable<U>): NonNullable<U> {
        return this.value[0] === ResultType.Ok ? fn(this.value[1]) : defaultValue();
    }

    public mapErr<F>(fn: (value: NonNullable<E>) => NonNullable<F>): Result<T, F> {
        return this.value[0] === ResultType.Ok ? Ok(this.value[1]) : Err(fn(this.value[1]));
    }

    public orElse<F>(fn: () => Result<T, F>): Result<T, F> {
        return this.value[0] === ResultType.Ok ? Ok(this.value[1]) : fn();
    }

    public andThen<U>(fn: (value: NonNullable<T>) => Result<U, E>): Result<U, E> {
        return this.value[0] === ResultType.Ok ? fn(this.value[1]) : Err(this.value[1]);
    }
}

export const Ok = Result.Ok;
export const Err = Result.Err;

enum ResultType {
    Ok,
    Err
}

