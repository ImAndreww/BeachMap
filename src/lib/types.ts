export type WorldRegion = {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  country_count: number;
};

export type Country = {
  id: string;
  world_region_id: string;
  name: string;
  slug: string;
  flag_emoji: string;
  description: string | null;
  cover_image_url: string | null;
};

export type Region = {
  id: string;
  country_id: string;
  name: string;
  slug: string;
  description: string | null;
};

export type City = {
  id: string;
  region_id: string;
  country_id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  description: string | null;
  cover_image_url: string | null;
};

export type Beach = {
  id: string;
  city_id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  blue_flag: boolean;
  blue_flag_year: number | null;
  description: string | null;
  cover_image_url: string | null;
  facilities: string[];
  water_quality: 'excellent' | 'good' | 'fair' | 'poor' | null;
  created_at: string;
  updated_at: string;
};

export type NavPath = {
  worldRegion?: WorldRegion;
  country?: Country;
  region?: Region;
  city?: City;
};
