export interface OrderAddRequest {
  product_id: string;
  quantity: number;
}

export interface OrderModifyRequest {
  quantity?: number;
}

export interface OrderResponse {
  id: string;
  product_id: string;
  quantity: number;
  buyer_id: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}
