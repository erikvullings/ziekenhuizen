import { BirthsInArea } from '../services/states';

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
  /** Totaal aantal geboorten binnen 25, binnen 30 en buiten 30 min regio na deactiveren ziekenhuizen */
  curline: BirthsInArea;
  /** PCs assigned to this hospital */
  coverage: Array<{
    pc: number;
    coord: [number, number];
    births: number;
    /** Category waar 0 is <25 min, 1 is 25~30 min, en 2 is >30 min aanrijdtijd. */
    cat: 0 | 1 | 2;
  }>;
  /** Totaal aantal bevallingen */
  bevallingen: number;
  /** Percentage bevallingen, 2e lijn ZH */
  perc2lLijnZh: number;
  /** Percentage bevallingen, geboortecentra/ZH 1e lijn */
  perc1lLijnZh: number;
  /** Percentage bevallingen, thuis 1e lijn */
  perc1lLijnThuis: number;
  /** Verwerkt het ziekenhuis bevallingen */
  active: boolean;
}
