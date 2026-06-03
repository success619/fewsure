export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

export interface Deal {
  id: string;
  title: string;
  description: string;
  price: number;
  image_urls: string[];
  user_id: string;
  profiles: Profile | null; 
}