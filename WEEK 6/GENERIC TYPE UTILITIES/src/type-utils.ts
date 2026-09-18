// 1. Recreate Partial
export type MyPartial<T> = {
  [P in keyof T]?: T[P];
};

// 2. Recreate Pick
export type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// 3. Recreate Exclude
export type MyExclude<T, U> = T extends U ? never : T;

// Recreate Omit using MyPick and MyExclude
export type MyOmit<T, K extends keyof T> = MyPick<
  T,
  MyExclude<keyof T, K>
>;

// 4. Recreate Record
export type MyRecord<K extends keyof any, V> = {
  [P in K]: V;
};

// 5. Stretch: The Head of a tuple
export type Head<T extends unknown[]> = T extends [
  infer First,
  ...unknown[]
]
  ? First
  : never;

// 6. Stretch: DeepReadonly
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};