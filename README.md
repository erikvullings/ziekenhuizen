# Selectie van ziekenhuizen

We proberen hier de volgende vraag te beantwoorden: Welke ziekenhuizen moeten open blijven voor goede geboortezorg,
waarbij in acht genomen moet worden dat iedere Nederlander het recht heeft om binnen 45 minuten bij een ziekenhuis te
komen?

Hoe beantwoorden we die vraag:

Allereerst gebruiken we de volgende data sets:

- De locatie van alle ziekenhuizen.
- Het aantal geboorten voor moeders jonger dan 20 jaar, van 20-25, 25-30, 30-35, 35-40, 40-45 en ouder dan 45 jaar, per
  provincie.
- Het aantal vrouwen per postcode in dezelfde leeftijdscategorieën (in 2018).
- De provincie per postcode.
- Perined geeft ons het percentage bevallingen dat thuis plaatsvindt, in geboortecentra/ziekenhuis 1ste lijn, of in een
  ziekenhuis 2de lijn.
- OpenRoute geeft ons (een indicatie) wat de bereikbaarheid is van een ziekenhuis: binnen 25 en 30 minuten rijafstand
  van een ziekenhuis. Er is niet voor 45 minuten gekozen, omdat een ambulance gemiddeld binnen 15 minuten ter plekke kan
  zijn (er zijn meer ambulanceposten dan ziekenhuizen), 5 minuten om de patiënt in te laden, en vervolgens 25 of 30
  minuten om bij een ziekenhuis te komen.

Deze data combineren we als volgt:

- Bereken per postcode hoeveel geboorten er plaatsvinden:
  - Per postcode, bepaal de provincie.
  - Bereken het aantal vrouwen van 15-20, 20-25, 25-30, 30-35, 35-40, 40-45, 45-50 per provincie
  - Per provincie is bekend hoeveel geboorten er plaatsvonden binnen een leeftijdscategorie.
  - Per postcode, bereken het aantal_geboorten_per_leeftijd = (totaal_aantal_geboorten_per_leeftijd \*
    aantal_vrouwen_in_pc_per_leeftijd / aantal_vrouwen_in_provincie_per_leeftijd)
  - Per postcode, bereken het totaal aantal geboorten als de som van aantal_geboorten_per_leeftijd
- Bereken per postcode hoe groot de afstand is tot ieder ziekenhuis:
  - Bereken de afstand hemelsbreed tot ieder ziekenhuis en sorteer op toenemende afstand.
  - Kijk ook of een postcode zich binnen de 25 of 30 minuten rijafstand bevindt.
  - Deze data wordt opgeslagen in `demografie.json`
- Bereken per ziekenhuis, hoeveel geboorten er plaatsvinden binnen 25 en 30 minuten rijafstand, en daarbuiten.
  - Doe dit door per postcode te kijken welk ziekenhuis het dichtste bij is, en alloceer alle geboorten aan het
    dichtstbijzijnde ziekenhuis.
  - Deze data wordt opgeslagen in `ziekenhuizen.geojson`
