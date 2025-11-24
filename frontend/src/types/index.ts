export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Garment {
  id: string;
  name: string;
  category: 'TOP' | 'BOTTOM' | 'DRESS' | 'OUTERWEAR' | 'SHOES' | 'ACCESSORY';
  color?: string;
  brand?: string;
  imageUrl: string;
  description?: string;
  createdAt: string;
}

export interface Outfit {
  id: string;
  name: string;
  createdAt: string;
  garments: {
    id: string;
    garment: Garment;
  }[];
}

export interface BodyImage {
  id: string;
  imageUrl: string;
  createdAt: string;
}

export interface TryOn {
  id: string;
  bodyImageId: string;
  outfitId?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  resultUrl?: string;
  createdAt: string;
  bodyImage?: BodyImage;
  outfit?: Outfit;
  garments?: {
    id: string;
    garment: Garment;
  }[];
}

export interface AuthResponse {
  user: User;
  token: string;
}
