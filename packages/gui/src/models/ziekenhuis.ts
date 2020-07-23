export interface IZiekenhuis {
  id: number;
  organisatie: string;
  locatie: string;
  plaats: string;
  adres: string;
  pc: string;
  gevoeligeZH: boolean;
  NICU: boolean;
  fullTimeSEH: boolean;
  avond: boolean;
  criteria: boolean;
  /** Totaal aantal geboorten binnen 25 min regio */
  t25: number;
  /** Totaal aantal geboorten binnen 30 min regio */
  t30: number;
  /** Totaal aantal geboorten buiten 30 min regio die hier opgevangen worden */
  tOv: number;
  active?: boolean;
}
