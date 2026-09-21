export type ProductError =
  | {
      kind: "product";
      code: "invalid-input";
      message: string;
      field?: string;
    }
  | {
      kind: "product";
      code: "duplicate-name";
      message: string;
      name: string;
    }
  | {
      kind: "product";
      code: "not-found";
      message: string;
      productId: string;
    };

export type OrderError =
  | {
      kind: "order";
      code: "invalid-input";
      message: string;
      field?: string;
    }
  | {
      kind: "order";
      code: "empty-items";
      message: string;
    }
  | {
      kind: "order";
      code: "product-not-found";
      message: string;
      productId: string;
    }
  | {
      kind: "order";
      code: "invalid-quantity";
      message: string;
      productId?: string;
    }
  | {
      kind: "order";
      code: "insufficient-stock";
      message: string;
      productId: string;
      available: number;
      requested: number;
    };

export type StorageError =
  | {
      kind: "storage";
      code: "not-found";
      message: string;
      id: string;
    }
  | {
      kind: "storage";
      code: "duplicate";
      message: string;
      id: string;
    }
  | {
      kind: "storage";
      code: "save-failed";
      message: string;
    };

export type AppError = ProductError | OrderError | StorageError;
