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
  product_name: string;
  quantity: number;
  total_amount: number;
  buyer_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}
