export const pipeline = [
  {
    name: "filter-active",
    transform: async data => ({
      ...data,
      users: data.users
        ? data.users.filter(user => user.isActive)
        : []
    })
  },
  {
    name: "calculate-stats",
    transform: async data => {
      const users = data.users || [];
      const products = data.products || [];
      const orders = data.orders || [];

      const totalRevenue = orders.reduce(
        (sum, order) => sum + order.amount,
        0
      );

      return {
        ...data,
        stats: {
          totalUsers: users.length,
          totalProducts: products.length,
          totalRevenue
        }
      };
    }
  },
  {
    name: "enrich-reviews",
    transform: async data => ({
      ...data,
      reviews: (data.reviews || []).map(review => ({
        ...review,
        sentiment: review.rating >= 4 ? "positive" : "negative"
      }))
    })
  }
];

export async function runSequential(data, transforms) {
  let result = data;

  for (const transform of transforms) {
    result = await transform.transform(result);
  }

  return result;
}

export async function runParallel(data, transforms) {
  const results = await Promise.all(
    transforms.map(transform => transform.transform(data))
  );

  return mergeResults(results);
}

function mergeResults(results) {
  return results.reduce((merged, result) => ({
    ...merged,
    ...result
  }), {});
}

export async function runPipeline(data, transforms, mode = "sequential") {
  if (mode === "parallel") {
    return runParallel(data, transforms);
  }

  return runSequential(data, transforms);
}
