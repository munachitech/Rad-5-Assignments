export function fetchProducts() {
  return new Promise((resolve, reject) => {
    const requestDelay = 800 + Math.random() * 1200;

    setTimeout(() => {
      if (Math.random() > 0.1) {
        resolve([
          { id: 1, name: "Laptop", price: 999, category: "Electronics" },
          { id: 2, name: "Keyboard", price: 79, category: "Electronics" },
          { id: 3, name: "Book", price: 29, category: "Education" }
        ]);
      } else {
        reject(new Error("Products API: Timeout"));
      }
    }, requestDelay);
  });
}
