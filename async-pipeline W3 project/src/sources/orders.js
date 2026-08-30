export function fetchOrders() {
  return new Promise((resolve, reject) => {
    const requestDelay = 600 + Math.random() * 1000;

    setTimeout(() => {
      if (Math.random() > 0.3) {
        resolve([
          { id: 1, userId: 1, productId: 1, amount: 999, date: "2026-08-01" },
          { id: 2, userId: 2, productId: 2, amount: 79, date: "2026-08-05" },
          { id: 3, userId: 1, productId: 3, amount: 29, date: "2026-08-10" }
        ]);
      } else {
        reject(new Error("Orders API: Rate limited"));
      }
    }, requestDelay);
  });
}
