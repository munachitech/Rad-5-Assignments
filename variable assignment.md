# JavaScript Fundamentals: Variables, Data Types, Coercion, Template Literals, Operators

## Variable declarations

```javascript
var x = 1;    // function-scoped, can redeclare, hoisted (avoid using this)
let y = 2;    // block-scoped, can reassign, NOT hoisted-usable
const z = 3;  // block-scoped, cannot reassign
```

- **`var`**: old-school, scoped to the whole function (ignores `{}` blocks). Causes bugs. Avoid in modern code.
- **`let`**: scoped to the nearest `{}` block. Use when the value will change.
- **`const`**: same block scoping as `let`, but the variable can't be reassigned. Note: for objects/arrays, the *contents* can still change — only the binding is locked.

```javascript
const arr = [1, 2];
arr.push(3);   // fine, mutating contents
arr = [4, 5];  // ERROR, reassigning the variable
```

**Rule of thumb:** default to `const`, use `let` when you need to reassign, avoid `var`.

## Data types

**Primitives** (immutable, compared by value):
- `string`, `number`, `boolean`, `undefined`, `null`, `symbol`, `bigint`

**Objects** (compared by reference):
- `object`, `array`, `function` (arrays and functions are technically objects)

```javascript
typeof "hi"          // "string"
typeof 42             // "number"
typeof true           // "boolean"
typeof undefined      // "undefined"
typeof null           // "object" (famous JS bug, just memorize this)
typeof {}             // "object"
typeof []              // "object"
typeof function(){}   // "function"
```

## Type coercion

JS automatically converts types in certain operations — sometimes helpful, sometimes a trap.

```javascript
"5" + 3     // "53"  (number becomes string, + means concat)
"5" - 3     // 2     (string becomes number, - only makes sense numerically)
"5" * "2"   // 10    (both coerced to numbers)
true + 1    // 2     (true becomes 1)
"" == 0     // true  (loose equality coerces types — avoid ==)
"" === 0    // false (strict equality checks type too — use this)
```

**Rule of thumb:** always use `===` and `!==`, never `==`/`!=`, unless you have a specific reason.

## Template literals

Backticks instead of quotes, lets you embed expressions with `${}`.

```javascript
const name = "Caris";
const greeting = `Hello, ${name}!`;          // "Hello, Caris!"
const math = `2 + 2 = ${2 + 2}`;             // "2 + 2 = 4"

// multi-line strings, no \n needed
const msg = `Line one
Line two`;
```

Much cleaner than old-style concatenation: `"Hello, " + name + "!"`.

## Operators (brief)

```javascript
// Arithmetic
+ - * / % **        // ** is exponent: 2 ** 3 = 8

// Comparison
=== !==              // strict (use these)
== !=                // loose (avoid)
> < >= <=

// Logical
&& || !               // and / or / not

// Assignment shortcuts
x += 1   x -= 1   x *= 2   x /= 2

// Nullish coalescing (ES2020) — falls back only on null/undefined
const val = someValue ?? "default";

// Optional chaining (ES2020) — safe access into nested objects
const city = user?.address?.city;
```