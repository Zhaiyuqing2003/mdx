export type OptionalKeys<T> = {
  [K in keyof T] -?: ({} extends {
    [P in K]: T[K];
  } ? K : never);
}[keyof T];


class T {
  public a : number;
  protected b : string;
  private c : boolean;

  d() {
    type b = Exclude<"a", keyof T>
  }
}

// type publicKeys = keyof T;
type a = keyof ((typeof T)["prototype"])

type b = T["b"]