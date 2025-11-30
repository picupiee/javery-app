import { User } from "firebase/auth";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
  photoURL?: string;
  address?: string;
  phoneNumber?: string;
}

export interface SellerProfile {
  uid: string;
  email: string;
  storeName: string;
  storeStatus: {
    isOpen: boolean;
    pingMessage?: string;
  };
  createdAt: string;
}

export interface AugmentedUser extends User {
  profile: UserProfile;
}

export interface Product {
  id: string;
  sellerUid: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  buyerUid: string;
  sellerUid: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  shippingAddress: string;
}
