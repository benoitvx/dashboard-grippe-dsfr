export interface SentiwebData {
  incidence: number;
  semaine: string;
  variation: number;
}

export interface RegionData {
  code: string; // Code région INSEE (ex: "11", "84")
  nom: string; // Nom de la région
  incidence: number; // Taux pour 100k habitants
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}
