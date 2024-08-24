# Webbtjänst (API) för att hantera arbetslivserfarenheter
Det här repot innehåller kod för ett enklare REST API byggt med Express. APIet är byggt för att hantera arbetslivserfarenhet/jobb som en form av CV. APIet är uppbyggt med CRUD (Create, Read, Update, Delete).

## Länk
En liveversion av APIet finns tillgänglig på följande URL: [https://moment-3-2serversida.onrender.com/dt207g/workexperiences]

## Installation, databas
APIet använder en MongoDB-databas. Alla id:n för objekten automatgenereras av MongoDB.
Klona källkodsfilerna, kör kommando npm install för att installera nödvändiga npm-paket. 

## Användning
Nedan finns beskrivet hur man når APIet med olika ändpunkter:

|Metod  |Ändpunkt            |Beskrivning                                                                           |
|-------|--------------------|--------------------------------------------------------------------------------------|
|GET    |/dt207g/workexperiences     |Hämtar all tillgänglig arbetslivserfarenhet.                                          |
|POST   |/workexperience     |Lagrar ett nytt jobb. Kräver att ett objekt skickas med.                              |
|PUT    |/workexperience/:id |Uppdaterar ett existerande jobb med angivet ID. Kräver att ett objekt skickas med.    |
|DELETE |/workexperience/:id |Raderar ett jobb med angivet ID.                                                      |

Ett objekt returneras/skickas som JSON med följande struktur:
```
  {
    "_id":"66c64c7a58457ce1d19cb66e",
    "companyname":"Regnbågens förskola",
    "jobtitle":"Förskolelärare",
    "location":"Brunflo",
    "description":"Se till att alla överlever dagen",
    "start_date":"2024-06-16T00:00:00.000Z",
    "end_date": "2024-07-20T00:00:00.000Z" (valfritt att inkludera)
  }
```