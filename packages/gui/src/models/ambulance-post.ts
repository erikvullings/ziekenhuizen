export interface IAmbulancePost {
  id: string;
  Standplaats: string;
  Straatnaam?: string;
  Huisnummer?: string;
  Plaats?: string;
  Postcode?: string;
  Beschikbaarheid?: string;
  lat?: number;
  lon?: number;
}
