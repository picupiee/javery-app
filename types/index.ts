import { FirebaseAuthTypes } from "@react-native-firebase/auth";
type User = FirebaseAuthTypes.User;

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
  roles: {
    buyer: boolean;
    seller: boolean;
  };
  // Seller-specific fields (only if seller role is true)
  storeName?: string;
  // Optional buyer/seller fields
  photoURL?: string;
  address?: string;
  phoneNumber?: string;
  expoPushToken?: string;
}

export interface SellerProfile {
  uid: string;
  email: string;
  storeName: string;
  storeDescription: string;
  storeStatus: {
    isOpen: boolean;
    pingMessage?: string;
  };
  createdAt: string;
  photoURL?: string;
  storeLocation?: { latitude: number; longitude: number } | null;
}

export interface Address {
  id: string;
  name: string; // e.g. "Home", "Office"
  recipientName: string;
  phoneNumber: string;
  fullAddress: string;
  notes?: string;
  isDefault?: boolean;
}

export interface CartItem {
  id: string; // productId
  productName: string;
  productPrice: number;
  productImage?: string;
  quantity: number;
  sellerUid: string;
  sellerName: string;
  sellerPhotoURL?: string;
}

export interface Order {
  id: string;
  buyerUid: string;
  sellerUid: string;
  sellerName: string;
  sellerPhoneNumber?: string;
  items: CartItem[];
  totalAmount: number;
  status: "waiting" | "processing" | "delivering" | "completed" | "cancelled";
  shippingAddress: Address;
  paymentMethod: "cod";
  createdAt: any; // Timestamp
  deliveryStartTime?: any; // Timestamp
  completedAt?: any; // Timestamp
}

export interface AugmentedUser extends User {
  profile: UserProfile;
}

export interface Product {
  id: string;
  sellerUid: string;
  sellerName?: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  category: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  photoURL?: string;
  storeLocation?: { latitude: number; longitude: number } | null;
}

export interface Ping {
  sellerUid: string;
  storeName: string;
  message: string;
  createdAt: any; // Firestore Timestamp
  photoURL?: string;
}

export interface CustomButtonProps {
  onPress?: () => void;
  title?: string;
  style?: string;
  leftIcon?: React.ReactNode;
  textStyle?: string;
  isLoading?: boolean;
}

export interface CustomInputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  label: string;
  secureTextEntry?: boolean;
  keyboardType?:
    | "default"
    | "email-address"
    | "numeric"
    | "phone-pad"
    | "phone-pad";
}
