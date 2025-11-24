export interface VaccinationLocation {
  finess: string;
  titre: string;
  adresse_voie1: string;
  adresse_voie2?: string;
  adresse_codepostal: string;
  adresse_ville: string;
  modalites_accueil: string;
  latitude: number;
  longitude: number;
}

export interface GeocodingResult {
  lat: number;
  lon: number;
  display_name: string;
}
