// Part A: Simulate API Calls

function fetchUsers() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.3) {
        resolve([
          { id: 1, name: "Ada" },
          { id: 2, name: "John" }
        ]);
      } else {
        reject(new Error("Users API failed"));
      }
    }, 1000);
  });
}

function fetchProducts() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.2) {
        resolve([
          { id: 1, name: "Laptop", price: 999 },
          { id: 2, name: "Phone", price: 699 }
        ]);
      } else {
        reject(new Error("Products API failed"));
      }
    }, 1500);
  });
}

function fetchOrders() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.4) {
        resolve([
          { id: 1, userId: 1, productId: 1, amount: 999 }
        ]);
      } else {
        reject(new Error("Orders API failed"));
      }
    }, 800);
  });
}


// Part B: Dashboard Loader

async function loadDashboard() {
  const results = await Promise.allSettled([
    fetchUsers(),
    fetchProducts(),
    fetchOrders()
  ]);

  const sources = ["users", "products", "orders"];

  const data = {
    users: null,
    products: null,
    orders: null
  };

  const errors = [];

  results.forEach((result, index) => {
    const source = sources[index];

    if (result.status === "fulfilled") {
      data[source] = result.value;
    } else {
      errors.push({
        source: source,
        message: result.reason.message
      });
    }
  });

  return {
    success: true,
    data: data,
    errors: errors,
    loadedAt: new Date().toISOString()
  };
}


// Part C: Timeout

function withTimeout(promise, milliseconds) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Request timed out"));
    }, milliseconds);

    promise
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}


// Retry failed API once

async function retryOnce(fetchFunction) {
  try {
    return await withTimeout(fetchFunction(), 3000);
  } catch (error) {
    console.log("First attempt failed. Retrying...");

    return await withTimeout(fetchFunction(), 3000);
  }
}


// Resilient Dashboard

async function loadDashboardResilient() {
  const results = await Promise.allSettled([
    retryOnce(fetchUsers),
    retryOnce(fetchProducts),
    retryOnce(fetchOrders)
  ]);

  const sources = ["users", "products", "orders"];

  const data = {
    users: null,
    products: null,
    orders: null
  };

  const errors = [];

  results.forEach((result, index) => {
    const source = sources[index];

    if (result.status === "fulfilled") {
      data[source] = result.value;
    } else {
      errors.push({
        source: source,
        message: result.reason.message
      });
    }
  });

  return {
    success: true,
    data: data,
    errors: errors,
    loadedAt: new Date().toISOString()
  };
}


// Run the resilient dashboard

loadDashboardResilient()
  .then((report) => {
    console.log("\nDashboard Report:");
    console.log(JSON.stringify(report, null, 2));
  })
  .catch((error) => {
    console.error("Dashboard failed:", error.message);
  });