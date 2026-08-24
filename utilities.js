// Part A: deepClone
const deepClone = (value) => {
  // Primitive values
  if (value === null || typeof value !== "object") {
    return value;
  }

  // Arrays
  if (Array.isArray(value)) {
    return value.map((item) => deepClone(item));
  }

  // Objects
  const clone = {};

  for (const key in value) {
    clone[key] = deepClone(value[key]);
  }

  return clone;
};


// Part B: debounce
const debounce = (func, wait) => {
  let timer;

  const debounced = (...args) => {
    clearTimeout(timer);

    timer = setTimeout(() => {
      func(...args);
    }, wait);
  };

  // Cancel pending function
  debounced.cancel = () => {
    clearTimeout(timer);
  };

  return debounced;
};


// Part C: throttle
const throttle = (func, wait, options = {}) => {
  let lastTime = 0;
  let timer = null;
  let lastArgs;

  const throttled = (...args) => {
    const now = Date.now();

    lastArgs = args;

    // Leading edge
    if (now - lastTime >= wait) {
      lastTime = now;
      func(...args);
      return;
    }

    // Trailing edge
    if (options.trailing && !timer) {
      timer = setTimeout(() => {
        lastTime = Date.now();
        timer = null;
        func(...lastArgs);
      }, wait - (now - lastTime));
    }
  };

  // Cancel method
  throttled.cancel = () => {
    clearTimeout(timer);
    timer = null;
    lastArgs = null;
  };

  return throttled;
};


// Part D: Memoize
const memoize = (func) => {
  const cache = new Map();

  return (...args) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      console.log("Returning cached result...");
      return cache.get(key);
    }

    const result = func(...args);
    cache.set(key, result);

    return result;
  };
};


// ===============================
// EXAMPLE USAGE
// ===============================

// Deep Clone
const original = {
  name: "Ada",
  address: {
    city: "Lagos",
    coordinates: {
      lat: 6.5,
      lng: 3.4
    }
  },
  hobbies: ["reading", "coding"]
};

const clone = deepClone(original);

clone.address.city = "Abuja";

console.log("Original city:", original.address.city);
console.log("Clone city:", clone.address.city);


// Debounce
const log = debounce((msg) => {
  console.log("Debounce:", msg);
}, 300);

log("hello");
log("hello");
log("hello");


// Throttle
const throttledLog = throttle(
  (msg) => console.log("Throttle:", msg),
  1000,
  { trailing: true }
);

throttledLog("a");
throttledLog("b");
throttledLog("c");


// Memoize
const add = memoize((a, b) => {
  console.log("Calculating...");
  return a + b;
});

console.log("Result:", add(2, 3));
console.log("Result:", add(2, 3)); // Uses cached result