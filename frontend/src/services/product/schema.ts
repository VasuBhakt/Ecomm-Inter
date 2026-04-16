export interface ProductAddRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
}

export interface ProductModifyRequest {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
}

export interface ProductResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  seller_id: string;
}
