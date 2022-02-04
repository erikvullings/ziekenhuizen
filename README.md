# Selectie van ziekenhuizen

We proberen hier de volgende vraag te beantwoorden: Welke ziekenhuizen moeten open blijven voor goede geboortezorg,
waarbij in acht genomen moet worden dat iedere Nederlander het recht heeft om binnen 45 minuten bij een ziekenhuis te
komen?

## Hoe beantwoorden we die vraag:

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
  - Bereken het aantal vrouwen van 15-20 jaar, 20-25, 25-30, 30-35, 35-40, 40-45, 45-50 jaar per provincie
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

De visualisatie laat:

- Alle ziekenhuizen zien
- Bij selectie van een ziekenhuis worden de postcodes getoond die het dichtste bij liggen:
  - Postcodes binnen de 25 minuten rijden zijn groen
  - Postcodes binnen de 30 minuten rijden zijn oranje
  - Postcodes buiten de 30 minuten rijden zijn rood
  - De diameter is een maat voor het aantal geboorten binnen deze postcode
  - Klik op een postcode cirkel voor de PC4 en het geboortecijfer.
- Een geselecteerd ziekenhuis toont ook het aantal geboorten binnen haar grenzen en het aantal geboorten in een
  geboortecentrum of tweedelijns ziekenhuis.
- Een geselecteerd ziekenhuis kan eventueel op non-actief gezet worden: de postcodes worden aan het meest nabij gelegen
  ziekenhuis overgedragen (per postcode wordt gekeken naar welk ziekenhuis het dichtste bij ligt).
- De kleur van een ziekenhuis geeft aan hoeveel extra belasting er is na het uitzetten van een nabijgelegen ziekenhuis:
  wit is neutraal, rood is voor een grote stijging (10x meer dan de oorspronkelijke belasting).
- Op landelijk niveau worden de gegevens per ziekenhuis geaggregeerd: een eenvoudige QoS wordt bepaald op basis van het
  aantal geboorten dat buiten de 25 min aanrijdtijd valt. Des te meer, des te lager de QoS.
- Optioneel kan de postcode kaartlaag uitgezet worden.
- Optioneel kan de aanrijdtijd kaartlaag van 25 min worden aangezet.
- Optioneel kan er voor een normale achtergrondkaart gekozen worden (i.p.v. de grijze)
- Optioneel kunnen de ambulanceposten getoond worden, en hun bereik in 15 minuten rijden
- Je kunt als volgt een scenario opslaan (naar `localstorage`, dus het werkt alleen in dezelfde browser op dezelfde PC):
  - Selecteer een scenario (rechtsboven, S1, S2 of S3)
  - Selecteer welke ziekenhuizen actief zijn op de gebruikelijke wijze
  - Druk op Save
  - Switch naar een ander scenario door de desbetreffende knop in te drukken: de pagina wordt dan weer opnieuw geladen met de gewenste ziekenhuizen die actief zijn.
