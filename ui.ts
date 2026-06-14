export type Delivery =
  | { type: "minecraft_command"; command: string }
  | { type: "discord_role"; roleId: string };

export interface Category {
  id: string;
  name: string;
  emoji?: string;
  description: string;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  priceCentavos: number;
  enabled: boolean;
  deliveries: Delivery[];
}

export interface Catalog {
  categories: Category[];
  products: Product[];
}

export interface PaymentIntent {
  id: string;
  user_id: string;
  amount_centavos: number;
  sender_phone: string | null;
  status: "pending" | "credited" | "cancelled";
  created_at: string;
}
