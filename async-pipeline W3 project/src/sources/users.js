export function fetchUsers() {
  return new Promise((resolve, reject) => {
    const requestDelay = 500 + Math.random() * 1500;

    setTimeout(() => {
      if (Math.random() > 0.2) {
        resolve([
          { id: 1, name: "Ada Lovelace", email: "ada@example.com", isActive: true },
          { id: 2, name: "Grace Hopper", email: "grace@example.com", isActive: true },
          { id: 3, name: "Alan Turing", email: "alan@example.com", isActive: false },
          { id: 4, name: "Margaret Hamilton", email: "margaret@example.com", isActive: true }
        ]);
      } else {
        reject(new Error("Users API: Service unavailable"));
      }
    }, requestDelay);
  });
}
