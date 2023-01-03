import { Ok, Err, Result } from './result';

export class Option<T> {
    private value : NonNullable<T> | null;
    private constructor(value : NonNullable<T> | null) {
        this.value = value;
    }

    public static Some<T>(value: NonNullable<T>): Option<T> {
        return new Option<T>(value);
    }

    public static get None(): Option<any> {
        return new Option<any>(null);
    }

    public isSome() {
        return this.value !== null;
    }

    public isNone() {
        return this.value === null;
    }

    public okOr<E>(err: NonNullable<E>): Result<T, E> {
        return this.value !== null ? Ok(this.value) : Err(err);
    }

    public okOrElse<E>(fn: () => NonNullable<E>): Result<T, E> {
        return this.value !== null ? Ok(this.value) : Err(fn());
    }

    public unwrap(): NonNullable<T> {
        if (this.value === null) {
            throw new Error('Option is None');
        }
        return this.value;
    }

    public expect(message: string): NonNullable<T> {
        if (this.value === null) {
            throw new Error(message);
        }
        return this.value;
    }

    public unwrapOr(defaultValue: NonNullable<T>): NonNullable<T> {
        return this.value !== null ? this.value : defaultValue;
    }

    public unwrapOrElse(fn: () => NonNullable<T>): NonNullable<T> {
        return this.value !== null ? this.value : fn();
    }

    public map<U>(fn: (value: NonNullable<T>) => NonNullable<U>): Option<U> {
        return this.value !== null ? Some(fn(this.value)) : None;
    }

    public mapOr<U>(defaultValue: NonNullable<U>, fn: (value: NonNullable<T>) => NonNullable<U>): NonNullable<U> {
        return this.value !== null ? fn(this.value) : defaultValue;
    }

    public mapOrElse<U>(defaultValue: () => NonNullable<U>, fn: (value : NonNullable<T>) => NonNullable<U>): NonNullable<U> {
        return this.value !== null ? fn(this.value) : defaultValue();
    }

    public filter(fn: (value: NonNullable<T>) => boolean): Option<T> {
        return this.value !== null && fn(this.value) ? this : None;
    }

    public flatten(): Option<T> {
        return this.value !== null && this.value instanceof Option ? this.value : this;
    }

    public orElse(fn: () => Option<T>): Option<T> {
        return this.value !== null ? this : fn();
    }

    public andThen<U>(fn: (value: NonNullable<T>) => Option<U>): Option<U> {
        return this.value !== null ? fn(this.value) : None;
    }
}

export const Some = Option.Some;
export const None = Option.None;


