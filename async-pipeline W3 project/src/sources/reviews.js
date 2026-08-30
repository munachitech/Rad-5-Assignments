export function fetchReviews() {
  return new Promise((resolve, reject) => {
    const requestDelay = 400 + Math.random() * 800;

    setTimeout(() => {
      if (Math.random() > 0.15) {
        resolve([
          { id: 1, productId: 1, rating: 5, text: "Excellent!" },
          { id: 2, productId: 2, rating: 4, text: "Good quality" },
          { id: 3, productId: 3, rating: 3, text: "Decent" }
        ]);
      } else {
        reject(new Error("Reviews API: Connection refused"));
      }
    }, requestDelay);
  });
}
