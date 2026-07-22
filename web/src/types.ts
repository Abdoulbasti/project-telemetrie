export interface User {
  id: number;
  email: string;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price_cents: number;
  image_url: string;
  stock: number;
}

export interface CartItem {
  product_id: number;
  quantity: number;
  name: string;
  price_cents: number;
  image_url: string;
  stock: number;
}

export interface Cart {
  items: CartItem[];
  total_cents: number;
}

export interface Order {
  id: number;
  status: "pending" | "paid";
  total_cents: number;
  shipping_name?: string;
  shipping_address?: string;
  created_at?: string;
  paid_at?: string | null;
}

export interface OrderItem {
  product_id: number;
  quantity: number;
  unit_price_cents: number;
  name: string;
  image_url: string;
}

export interface OrderDetail extends Order {
  items: OrderItem[];
}
