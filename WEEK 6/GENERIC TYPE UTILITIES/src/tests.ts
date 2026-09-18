import {
  MyPartial,
  MyPick,
  MyOmit,
  MyRecord,
  Head,
  DeepReadonly,
} from "./type-utils";

// Test interface
interface User {
  id: number;
  name: string;
  email: string;
}

// 1. MyPartial
const partialUser: MyPartial<User> = {
  name: "Ada",
};

// 2. MyPick
const nameOnly: MyPick<User, "name"> = {
  name: "Ada",
};

// 3. MyOmit
const noEmail: MyOmit<User, "email"> = {
  id: 1,
  name: "Ada",
};

// 4. MyRecord
const map: MyRecord<"a" | "b", number> = {
  a: 1,
  b: 2,
};

// 5. Head
type H = Head<["a", "b", "c"]>;

const firstValue: H = "a";

// 6. DeepReadonly
interface Profile {
  name: string;
  address: {
    city: string;
  };
}

const readonlyProfile: DeepReadonly<Profile> = {
  name: "Ada",
  address: {
    city: "Lagos",
  },
};

console.log(partialUser);
console.log(nameOnly);
console.log(noEmail);
console.log(map);
console.log(firstValue);
console.log(readonlyProfile);