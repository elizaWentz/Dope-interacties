/* Zone 2 – Volg het middel
   Overgenomen uit het bestaande prototype. Aangepast is alleen wat nodig was
   om binnen de gezamenlijke website te werken: imports/export, de CSS
   in zone2.css (onder .z2) en de knop "Terug naar startscherm". */
import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './zone2.css';

/* ---------------- Iconen ---------------- */
const C=(cx,cy,r)=>`M${cx-r},${cy}a${r},${r} 0 1,0 ${2*r},0a${r},${r} 0 1,0 ${-2*r},0`;
const ICONS={
  factory:["M3 20V11l5 3v-3l5 3v-3l5 3V4h3v16z","M7 17h2M12 17h2M17 17h1"],
  flask:["M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3","M7.5 15h9"],
  truck:["M2 6h11v10H2z","M13 9h4l4 4v3h-8",C(6,18,2),C(17,18,2)],
  shop:["M4 9l1.5-5h13L20 9","M4 9h16v1.5a2.7 2.7 0 0 1-5.3 0 2.7 2.7 0 0 1-5.4 0A2.7 2.7 0 0 1 4 10.5z","M5 13v7h14v-7","M10 20v-4h4v4"],
  person:[C(12,8,4),"M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"],
  bottle:["M10 2h4v4l1.5 2.5V21h-7V8.5L10 6z","M8.5 13h7"],
  leaf:["M12 22V11","M12 11C12 6 8 3 4 3c0 5 3 8 8 8z","M12 14c0-4 3-7 8-7 0 4-3 7-8 7z"],
  pill:[C(12,12,8),"M5.5 9.5h13","M9 15.5h6"],
  euro:["M17 5.5A7 7 0 1 0 17 18.5","M4 10h9M4 14h9"],
  box:["M3 7l9-4 9 4v10l-9 4-9-4z","M3 7l9 4 9-4","M12 11v10"],
  briefcase:["M3 7h18v13H3z","M8 7V4h8v3","M3 12h18"],
  shield:["M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z","M8.5 12l2.5 2.5 4.5-5"],
  heart:["M12 20s-8-4.5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6.5-8 11-8 11z"],
  lock:["M5 11h14v10H5z","M8 11V7a4 4 0 0 1 8 0v4"],
  ban:[C(12,12,9),"M5.6 5.6l12.8 12.8"],
  open:["M3 12h18","M15 6l6 6-6 6","M9 6l-6 6 6 6"],
  alert:["M12 3l10 18H2z","M12 10v5","M12 18v.5"],
  question:[C(12,12,9),"M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7","M12 17v.5"],
  hand:["M9 11V5a1.5 1.5 0 0 1 3 0v6","M12 10V9a1.5 1.5 0 0 1 3 0v2","M15 11a1.5 1.5 0 0 1 3 0v4a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-2.7L3.5 14a1.5 1.5 0 0 1 2.5-1.7L9 15"],
  mask:["M3 9c3-2 6-2 9 0 3-2 6-2 9 0 0 5-3 8-6 8-1.5 0-2.3-1-3-2-.7 1-1.5 2-3 2-3 0-6-3-6-8z","M6.5 11h2.5M15 11h2.5"],
  clock:[C(12,12,9),"M12 7v5l3 2"],
  up:["M12 19V5","M6 11l6-6 6 6"],
  down:["M12 5v14","M6 13l6 6 6-6"],
  mix:["M8 4v16M4 8l4-4 4 4","M16 20V4M12 16l4 4 4-4"],
  plus:["M12 5v14M5 12h14"],
  refresh:["M20 12a8 8 0 1 1-2.3-5.7","M20 4v5h-5"],
  grid:["M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"],
  route:[C(6,18,2.5),C(18,6,2.5),"M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5"],
  link:["M10 14a4 4 0 0 0 5.6 0l3-3a4 4 0 0 0-5.6-5.6l-1 1","M14 10a4 4 0 0 0-5.6 0l-3 3a4 4 0 0 0 5.6 5.6l1-1"],
  play:["M7 4l13 8-13 8z"],
  x:["M6 6l12 12M18 6L6 18"],
  left:["M15 5l-7 7 7 7"], right:["M9 5l7 7-7 7"],
};
function Icon({n,s=24,c="currentColor",w=1.9}){
  const p=ICONS[n]||ICONS.question;
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">{p.map((d,i)=><path key={i} d={d}/>)}</svg>;
}
function SvgIcon({n,x,y,s,c,w=1.9}){
  const p=ICONS[n]||ICONS.question;
  return <svg x={x} y={y} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">{p.map((d,i)=><path key={i} d={d}/>)}</svg>;
}

/* ---------------- Basisgegevens ---------------- */
const KIND={
  up:{c:"#2b7bc4",icon:"up",word:"licht op"},
  down:{c:"#d4512c",icon:"down",word:"verzwakt"},
  warn:{c:"#d99a00",icon:"alert",word:"onder druk"},
  mix:{c:"#d99a00",icon:"mix",word:"onzeker"},
  new:{c:"#7a4fd0",icon:"plus",word:"nieuwe route"},
};
const STYLE={
  strenger:{c:"#d99a00",icon:"lock",label:"Strengere regels",w:9,speed:3.2},
  verbod:{c:"#d23b3b",icon:"ban",label:"Verbod",w:10,speed:0},
  gereguleerd:{c:"#2b7bc4",icon:"shield",label:"Gereguleerd",w:14,speed:1.3},
  ruimer:{c:null,icon:"open",label:"Ruimer toegestaan",w:22,speed:.8},
};
const IND={
  prijs:{label:"Prijs",icon:"euro",up:"hoger",down:"lager"},
  aanbod:{label:"Beschikbaarheid",icon:"box",up:"groter",down:"kleiner"},
  ondernemers:{label:"Ondernemers",icon:"briefcase",up:"sterker",down:"zwakker"},
  veiligheid:{label:"Veiligheid",icon:"shield",up:"beter",down:"slechter"},
  gezondheid:{label:"Volksgezondheid",icon:"heart",up:"beter",down:"slechter"},
};
const NODE_POS={prod:{x:110,y:290},verv:{x:450,y:290},verk:{x:790,y:290},cons:{x:1130,y:290},illegaal:{x:620,y:575}};
const NODE_BASE={prod:{label:"Productie"},verv:{label:"Vervoer"},verk:{label:"Verkoop"},cons:{label:"Consument"}};
const LINKS=[{from:"prod",to:"verv"},{from:"verv",to:"verk"},{from:"verk",to:"cons"}];
const linkName=i=>`${NODE_BASE[LINKS[i].from].label} → ${NODE_BASE[LINKS[i].to].label}`;

function geom(a,b){
  const c={x:(a.x+b.x)/2,y:(a.y+b.y)/2-80};
  return {d:`M${a.x},${a.y} Q${c.x},${c.y} ${b.x},${b.y}`,lp:{x:.25*a.x+.5*c.x+.25*b.x,y:.25*a.y+.5*c.y+.25*b.y}};
}
const LG=LINKS.map(l=>geom(NODE_POS[l.from],NODE_POS[l.to]));

const E=(target,kind,title,text,ind={},extra={})=>({target,kind,title,text,ind,...extra});

/* ---------------- Inhoud per middel ----------------
   Alle regeltekst is VOORBEELDTEKST voor dit prototype en moet inhoudelijk worden gecontroleerd. */
const SUBS={
  alcohol:{
    name:"Alcohol",color:"#e08a1e",on:"#2a1a05",icon:"bottle",status:"Legaal, met regels",
    nodes:{prod:{icon:"factory",sub:"Brouwerij en stokerij"},verv:{icon:"truck",sub:"Groothandel en transport"},verk:{icon:"shop",sub:"Winkel en horeca"},cons:{icon:"person",sub:"Volwassen koper"}},
    illegalLabel:"Informele markt",
    links:[
      {current:"Bedrijven mogen alcohol maken en vervoeren als zij zich aan de regels houden, bijvoorbeeld rond vergunningen en belasting.",
       options:[
        {id:"accijns",label:"Hogere belasting bij de bron",short:"Producenten betalen meer per liter.",style:"strenger",
         direct:E("prod","warn","Producenten betalen meer","Produceren wordt mogelijk duurder.",{prijs:"up"}),
         further:[E("verk","down","Duurdere inkoop","Winkels en horeca kopen mogelijk duurder in.",{ondernemers:"down"}),
                  E("cons","down","Hogere prijzen","Consumenten betalen mogelijk meer. Sommigen drinken minder.",{prijs:"up",gezondheid:"up"})]},
        {id:"ambacht",label:"Minder regels voor kleine makers",short:"Kleine brouwers en stokers kunnen makkelijker starten.",style:"ruimer",
         direct:E("prod","up","Meer kleine makers","Er komen mogelijk meer kleine brouwers en stokers.",{ondernemers:"up"}),
         further:[E("verv","up","Meer leveringen","Meer en kleinere leveringen door het land.",{aanbod:"up"}),
                  E("cons","warn","Meer keuze, minder toezicht?","Meer aanbod, maar controle op kwaliteit wordt mogelijk lastiger.",{veiligheid:"mix"})]},
        {id:"verbod",label:"Productie verbieden",short:"Niemand mag nog legaal alcohol maken.",style:"verbod",
         direct:E("prod","down","Legale productie stopt","Bedrijven moeten stoppen of vertrekken.",{ondernemers:"down"}),
         further:[E("illegaal","new","Illegale productie","Er ontstaat mogelijk een illegale markt, zoals tijdens de drooglegging in de Verenigde Staten.",{veiligheid:"down"},{newLabel:"Illegale productie"}),
                  E("cons","warn","Onbekende kwaliteit","Consumenten weten minder zeker wat ze drinken.",{gezondheid:"down",prijs:"up"})]},
       ]},
      {current:"Alcohol mag naar winkels en horeca worden vervoerd. Daarbij gelden regels voor administratie, belasting en veiligheid.",
       options:[
        {id:"streng",full:true,label:"Strengere vervoersbeperkingen",short:"Bijvoorbeeld extra controles en strengere eisen aan vervoerders.",style:"strenger",
         direct:E("verv","warn","Vervoer wordt ingewikkelder of duurder","Vervoerders hebben meer tijd, papierwerk en geld nodig voor dezelfde lading.",{prijs:"up"}),
         further:[E("verk","down","Verkopers onder druk","Sommige verkopers krijgen mogelijk hogere kosten of minder voorraad.",{ondernemers:"down",aanbod:"down"}),
                  E("cons","down","Hogere prijzen, minder aanbod","Consumenten kunnen hogere prijzen of een beperktere beschikbaarheid ervaren.",{prijs:"up",aanbod:"down",gezondheid:"mix"}),
                  E("illegaal","new","Uitwijken naar andere routes","Een deel van de kopers zoekt mogelijk andere wegen, zoals kopen over de grens.",{veiligheid:"down"},{newLabel:"Over de grens kopen"})],
         scenes:[
          {tag:"De nieuwe regel",title:"Strengere vervoersbeperkingen",text:"In dit scenario komen er strengere regels voor het vervoer van alcohol naar winkels en horeca. Denk aan extra controles en strengere eisen.",items:[{icon:"truck",label:"Vervoer"},{icon:"lock",label:"Nieuwe regels",color:"#d99a00"},{icon:"shop",label:"Verkoop"}]},
          {tag:"Direct gevolg",title:"Vervoer wordt ingewikkelder of duurder",text:"Vervoerders hebben meer tijd, papierwerk en geld nodig om dezelfde lading af te leveren.",items:[{icon:"truck",label:"Vervoerder",badge:"warn"},{icon:"clock",label:"Meer tijd",badge:"up"},{icon:"euro",label:"Meer kosten",badge:"up",float:true}]},
          {tag:"Mogelijk vervolg",title:"Verkopers krijgen het lastiger",text:"Sommige winkels en horecazaken krijgen mogelijk hogere kosten of minder voorraad. Kleine zaken merken dat misschien als eerste.",items:[{icon:"euro",label:"Hogere inkoop",badge:"up",float:true},{icon:"shop",label:"Verkoper",badge:"down"},{icon:"box",label:"Minder voorraad",badge:"down"}]},
          {tag:"Mogelijk vervolg",title:"Consumenten merken het in de winkel",text:"Consumenten kunnen hogere prijzen of een beperktere keuze tegenkomen.",items:[{icon:"shop",label:"Winkel"},{icon:"person",label:"Consument",badge:"warn"},{icon:"bottle",label:"Minder keuze",badge:"down"}]},
          {tag:"Maatschappij",title:"Gezondheid en veiligheid",text:"Hogere prijzen kunnen ertoe leiden dat sommige mensen minder drinken. Tegelijk kopen anderen misschien meer over de grens of via informele kanalen.",items:[{icon:"heart",label:"Gezondheid",badge:"mix"},{icon:"person",label:"Koper"},{icon:"route",label:"Andere route",badge:"new"}]},
         ]},
        {id:"vergunning",label:"Speciale vervoersvergunning",short:"Alleen vervoerders met een extra vergunning mogen alcohol rijden.",style:"gereguleerd",
         direct:E("verv","warn","Minder vervoerders","Alleen vervoerders met vergunning mogen nog rijden.",{ondernemers:"down"}),
         further:[E("verk","down","Minder keuze in leveranciers","Verkopers zijn mogelijk afhankelijker van een paar vervoerders.",{aanbod:"mix"}),
                  E("cons","warn","Kleine prijsstijging","Prijzen kunnen iets stijgen.",{prijs:"up"})]},
        {id:"staat",label:"Vervoer via één staatsbedrijf",short:"De overheid regelt al het vervoer zelf.",style:"gereguleerd",
         direct:E("verv","warn","Eén vervoerder","Particuliere vervoerders verdwijnen van deze route.",{ondernemers:"down"}),
         further:[E("verk","warn","Vaste leveringen","Leveringen worden mogelijk voorspelbaarder, maar minder flexibel.",{aanbod:"mix"}),
                  E("cons","up","Meer zicht op de markt","De overheid weet beter wat er verkocht wordt.",{veiligheid:"up"})]},
       ]},
      {current:"Vergunde winkels en horeca mogen alcohol verkopen aan volwassenen. Er gelden onder meer leeftijdsregels.",
       options:[
        {id:"staatswinkel",label:"Alleen verkoop in staatswinkels",short:"Supermarkten en slijterijen stoppen met alcohol.",style:"gereguleerd",
         direct:E("verk","down","Minder verkooppunten","Alleen speciale overheidswinkels verkopen nog alcohol.",{aanbod:"down",ondernemers:"down"}),
         further:[E("cons","warn","Verder reizen","Kopen kost meer moeite.",{aanbod:"down"}),
                  E("link2","down","Minder impulsaankopen","Mensen kopen mogelijk minder spontaan.",{gezondheid:"up"})]},
        {id:"tijden",label:"Kortere verkooptijden",short:"Verkoop alleen op bepaalde uren.",style:"strenger",
         direct:E("link2","down","Minder verkoopuren","Verkoop kan alleen op bepaalde tijden.",{aanbod:"down"}),
         further:[E("verk","down","Minder omzet","Winkels en horeca verkopen mogelijk minder.",{ondernemers:"down"}),
                  E("cons","warn","Inslaan of uitwijken","Sommige mensen kopen vooraf meer in.",{gezondheid:"mix"})]},
        {id:"verbod",label:"Verkoop verbieden",short:"Geen legale verkoop meer aan consumenten.",style:"verbod",
         direct:E("verk","down","Legale verkoop stopt","Winkels en horeca mogen geen alcohol meer verkopen.",{ondernemers:"down",aanbod:"down"}),
         further:[E("illegaal","new","Verkoop gaat ondergronds","Er ontstaat mogelijk illegale verkoop.",{veiligheid:"down"},{newLabel:"Illegale verkoop"}),
                  E("cons","warn","Risico op slechte kwaliteit","Zonder controle is de kwaliteit onzeker.",{gezondheid:"down"})]},
       ]},
    ]},
  cannabis:{
    name:"Cannabis",color:"#2e9a58",on:"#ffffff",icon:"leaf",status:"Deels gedoogd",
    nodes:{prod:{icon:"leaf",sub:"Teler"},verv:{icon:"truck",sub:"Aanvoer"},verk:{icon:"shop",sub:"Coffeeshop"},cons:{icon:"person",sub:"Volwassen gebruiker"}},
    illegalLabel:"Illegale markt",
    links:[
      {current:"Teelt voor coffeeshops is grotendeels niet toegestaan. Er wordt geëxperimenteerd met gereguleerde teelt.",
       options:[
        {id:"regulier",label:"Teelt gereguleerd toestaan",short:"Telers werken met vergunning en controle.",style:"gereguleerd",
         direct:E("prod","up","Legale telers","Teelt gebeurt zichtbaar, met vergunning en controle.",{ondernemers:"up"}),
         further:[E("illegaal","down","Illegale teelt onder druk","De illegale markt krimpt mogelijk.",{veiligheid:"up"}),
                  E("cons","up","Bekendere kwaliteit","Consumenten weten beter wat ze kopen.",{gezondheid:"up"})]},
        {id:"streng",label:"Strenger optreden tegen teelt",short:"Meer controles en hogere straffen.",style:"strenger",
         direct:E("prod","down","Minder telers","Telers stoppen of verplaatsen zich.",{aanbod:"down"}),
         further:[E("illegaal","new","Teelt verplaatst","Teelt verschuift mogelijk naar verborgen plekken.",{veiligheid:"down"}),
                  E("cons","warn","Hogere prijzen","Schaarste kan prijzen opdrijven.",{prijs:"up"})]},
       ]},
      {current:"Hoe coffeeshops aan hun voorraad komen, valt in een grijs gebied. Verkoop aan de voordeur wordt gedoogd, inkoop aan de achterdeur niet.",
       options:[
        {id:"regulier",label:"Gereguleerde aanvoer",short:"Leveringen aan coffeeshops worden legaal en geregistreerd.",style:"gereguleerd",
         direct:E("verv","up","Transparante aanvoer","Leveringen worden geregistreerd.",{veiligheid:"up"}),
         further:[E("verk","up","Zekerheid voor coffeeshops","Ondernemers lopen mogelijk minder risico.",{ondernemers:"up"}),
                  E("cons","up","Meer controle op kwaliteit","Producten kunnen worden getest.",{gezondheid:"up"})]},
        {id:"streng",label:"Strengere controles op aanvoer",short:"Meer controles op de weg naar de coffeeshop.",style:"strenger",
         direct:E("verv","warn","Riskanter vervoer","Aanvoer wordt lastiger en duurder.",{prijs:"up"}),
         further:[E("verk","down","Krappe voorraad","Coffeeshops hebben mogelijk minder voorraad.",{aanbod:"down",ondernemers:"down"}),
                  E("illegaal","new","Straathandel","Kopers wijken mogelijk uit naar de straat.",{veiligheid:"down"},{newLabel:"Straathandel"})]},
       ]},
      {current:"Coffeeshops mogen onder voorwaarden kleine hoeveelheden verkopen aan volwassenen.",
       options:[
        {id:"apotheek",label:"Alleen via de apotheek",short:"Verkoop verschuift van coffeeshop naar apotheek.",style:"gereguleerd",
         direct:E("verk","down","Coffeeshops verdwijnen","Verkoop verschuift naar apotheken.",{ondernemers:"down"}),
         further:[E("cons","warn","Hogere drempel","Kopen wordt formeler en minder anoniem.",{aanbod:"down"}),
                  E("illegaal","new","Uitwijken","Een deel van de kopers zoekt het elders.",{veiligheid:"down"})]},
        {id:"sluiten",label:"Coffeeshops sluiten",short:"Geen gedoogde verkoop meer.",style:"verbod",
         direct:E("verk","down","Geen gedoogde verkoop","Coffeeshops gaan dicht.",{ondernemers:"down",aanbod:"down"}),
         further:[E("illegaal","new","Straathandel groeit","Verkoop verschuift mogelijk naar de straat.",{veiligheid:"down"},{newLabel:"Straathandel"}),
                  E("cons","warn","Onbekende kwaliteit","Minder zicht op wat er verkocht wordt.",{gezondheid:"down"})]},
        {id:"winkels",label:"Verkoop in vergunde winkels",short:"Ook andere winkels met vergunning mogen verkopen.",style:"ruimer",
         direct:E("verk","up","Meer verkooppunten","Meer winkels mogen verkopen.",{aanbod:"up",ondernemers:"up"}),
         further:[E("cons","up","Makkelijker te krijgen","Prijzen kunnen dalen.",{prijs:"down"}),
                  E("link2","up","Meer gebruik?","Sommige mensen gaan mogelijk vaker gebruiken.",{gezondheid:"mix"})]},
       ]},
    ]},
  mdma:{
    name:"MDMA",color:"#cc3f86",on:"#ffffff",icon:"pill",status:"Verboden",
    nodes:{prod:{icon:"flask",sub:"Lab"},verv:{icon:"truck",sub:"Transport en smokkel"},verk:{icon:"shop",sub:"Dealer"},cons:{icon:"person",sub:"Gebruiker"}},
    illegalLabel:"Illegale markt",
    links:[
      {current:"Het maken van MDMA is verboden.",
       options:[
        {id:"farma",label:"Gereguleerde productie",short:"Productie onder strenge controle, zoals bij medicijnen.",style:"gereguleerd",
         direct:E("prod","up","Gecontroleerde productie","Productie gebeurt onder strenge controle.",{veiligheid:"up"}),
         further:[E("illegaal","down","Illegale labs onder druk","Illegale productie verliest mogelijk klanten.",{}),
                  E("cons","up","Bekende dosering","Pillen hebben een vaste sterkte.",{gezondheid:"up"})]},
        {id:"grondstof",label:"Strengere controle op grondstoffen",short:"Chemicaliën zijn moeilijker te krijgen.",style:"strenger",
         direct:E("prod","warn","Moeilijker produceren","Grondstoffen zijn lastiger te krijgen.",{aanbod:"down"}),
         further:[E("illegaal","new","Andere chemicaliën","Makers zoeken mogelijk andere stoffen.",{veiligheid:"down"},{newLabel:"Alternatieve stoffen"}),
                  E("cons","warn","Onvoorspelbare pillen","De samenstelling kan meer gaan wisselen.",{gezondheid:"down"})]},
       ]},
      {current:"Vervoer van en handel in MDMA zijn verboden.",
       options:[
        {id:"smokkel",label:"Hardere aanpak van smokkel",short:"Meer controles en zwaardere straffen.",style:"strenger",
         direct:E("verv","down","Meer onderscheppingen","Smokkel wordt riskanter.",{aanbod:"down"}),
         further:[E("verk","warn","Hogere prijzen","Het risico wordt doorberekend.",{prijs:"up"}),
                  E("illegaal","new","Nieuwe routes","Smokkelaars zoeken mogelijk andere routes.",{veiligheid:"mix"},{newLabel:"Nieuwe smokkelroutes"})]},
        {id:"apotheekketen",label:"Vervoer via de apotheekketen",short:"Vervoer zoals bij medicijnen.",style:"gereguleerd",
         direct:E("verv","up","Legaal transport","Vervoer onder toezicht.",{veiligheid:"up"}),
         further:[E("verk","up","Gecontroleerde voorraad","Verkooppunten weten wat ze krijgen.",{aanbod:"mix"}),
                  E("illegaal","down","Minder smokkel","Vraag naar smokkelwaar daalt mogelijk.",{})]},
       ]},
      {current:"Verkoop is verboden. Op sommige plekken kunnen gebruikers hun pillen laten testen.",
       options:[
        {id:"testen",label:"Meer testlocaties",short:"Makkelijker laten testen wat je hebt.",style:"ruimer",
         direct:E("link2","warn","Meer inzicht","Gebruikers laten vaker testen wat ze hebben.",{}),
         further:[E("cons","up","Gevaarlijke pillen sneller bekend","Waarschuwingen bereiken meer mensen.",{gezondheid:"up"}),
                  E("verk","warn","Druk op verkopers","Verkopers van slechte pillen vallen sneller door de mand.",{veiligheid:"up"})]},
        {id:"verkooppunten",label:"Gereguleerde verkooppunten",short:"Verkoop met voorlichting en leeftijdsgrens.",style:"gereguleerd",
         direct:E("verk","up","Legale verkoop","Verkoop met voorlichting en controle.",{aanbod:"up"}),
         further:[E("illegaal","down","Kleinere zwarte markt","Dealers verliezen mogelijk klanten.",{veiligheid:"up"}),
                  E("cons","warn","Meer of veiliger gebruik?","Gebruik kan stijgen, maar ook veiliger worden.",{gezondheid:"mix"})]},
        {id:"straffen",label:"Strenger straffen bij bezit",short:"Hogere straffen voor gebruikers.",style:"strenger",
         direct:E("cons","down","Gebruikers verstoppen zich","Minder mensen laten testen of vragen hulp.",{gezondheid:"down"}),
         further:[E("verk","warn","Handel dieper ondergronds","Verkoop wordt minder zichtbaar.",{veiligheid:"down"}),
                  E("link2","down","Minder zichtbaar gebruik","Gebruik wordt minder zichtbaar, maar niet per se minder.",{})]},
       ]},
    ]},
};

/* helpers */
const effectsOf=o=>o?[o.direct,...o.further]:[];
const posOf=t=>t.startsWith("link")?LG[+t.slice(4)].lp:NODE_POS[t];
function targetInfo(t,sub){
  if(t.startsWith("link")) return {icon:"link",label:linkName(+t.slice(4))};
  if(t==="illegaal") return {icon:"mask",label:sub.illegalLabel};
  return {icon:sub.nodes[t].icon,label:NODE_BASE[t].label};
}
function buildScenes(sub,li,o){
  const L=LINKS[li], st=STYLE[o.style];
  const sc = o.scenes ? [...o.scenes] : [
    {tag:"De nieuwe regel",title:o.label,text:o.short,items:[
      {icon:sub.nodes[L.from].icon,label:NODE_BASE[L.from].label},
      {icon:st.icon,label:st.label,color:st.c||sub.color},
      {icon:sub.nodes[L.to].icon,label:NODE_BASE[L.to].label}]},
    ...effectsOf(o).map((e,i)=>{
      const ti=targetInfo(e.target,sub);
      const extra=Object.entries(e.ind).slice(0,2).map(([k,v])=>({icon:IND[k].icon,label:`${IND[k].label} ${v==="mix"?"onzeker":IND[k][v]}`,badge:v,float:k==="prijs"}));
      return {tag:i===0?"Direct gevolg":"Mogelijk vervolg",title:e.title,text:e.text,items:[{icon:ti.label===sub.illegalLabel&&e.newLabel?"mask":ti.icon,label:e.newLabel||ti.label,badge:e.kind},...extra]};
    })];
  sc.push({tag:"In het kort",summary:true,title:"Mogelijke gevolgen voor de samenleving",text:"",items:[]});
  sc.push({tag:"Wat denk jij?",title:"Dit is een mogelijk scenario",text:"Wat er echt gebeurt, hangt af van veel factoren. Ook deskundigen zijn het hier niet altijd over eens. Ga terug naar het netwerk en probeer een andere keuze.",items:[{icon:"question",label:"Mogelijk"},{icon:"mix",label:"Onzeker"},{icon:"route",label:"Probeer opnieuw"}]});
  return sc;
}

/* ---------------- Pulse (domino-bal) ---------------- */
function Pulse({from,to,color,dur=800}){
  const [p,setP]=useState(from);
  useEffect(()=>{let raf,t0;const f=t=>{if(!t0)t0=t;let k=Math.min(1,(t-t0)/dur);k=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
    setP({x:from.x+(to.x-from.x)*k,y:from.y+(to.y-from.y)*k-Math.sin(k*Math.PI)*70});if(k<1)raf=requestAnimationFrame(f)};
    raf=requestAnimationFrame(f);return()=>cancelAnimationFrame(raf)},[from,to]);
  return <g style={{pointerEvents:"none"}}>
    <circle cx={p.x} cy={p.y} r={36} fill={color} opacity=".22"/>
    <circle cx={p.x} cy={p.y} r={17} fill="#fff" stroke={color} strokeWidth="7"/>
  </g>;
}

/* ---------------- Netwerk ---------------- */
const FONT_H={fontFamily:"Bricolage Grotesque, sans-serif"}, FONT_B={fontFamily:"DM Sans, sans-serif"};
function Network({sub,sel,onLink,opt,nodeFx,linkFx,illegal,pulse,phase}){
  const col=sub.color, showPills = sel==null;
  return <svg width="1260" height="660" viewBox="0 0 1260 660">
    <defs><filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16"/></filter></defs>

    {/* alternatieve route: alleen als gevolg van een keuze */}
    {illegal && <g className="fadeSvg" style={{opacity:illegal.kind==="down"?.45:1,transition:"opacity .6s"}}>
      {[["prod","illegaal"],["illegaal","cons"]].map(([a,b],i)=>{const lift=p=>p.y<500?{x:p.x,y:p.y+180}:p;const A=lift(NODE_POS[a]),B=lift(NODE_POS[b]);
        const d= a==="prod" ? `M${A.x},${A.y} Q${A.x},${B.y} ${B.x},${B.y}` : `M${A.x},${A.y} Q${B.x},${A.y} ${B.x},${B.y}`;
        return <g key={i}><path d={d} stroke="#7a4fd0" strokeWidth="5" fill="none" strokeDasharray="14 12" opacity=".55"/>
          <path d={d} stroke="#7a4fd0" strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray="0 30" className="flowF" style={{animationDuration:"1.8s"}}/></g>})}
    </g>}

    {/* verbindingen */}
    {LINKS.map((l,i)=>{
      const g=LG[i], selected=sel===i, changed=selected&&opt;
      const st=changed?STYLE[opt.style]:null, fx=linkFx[i];
      let c=st?(st.c||col):col, w=st?st.w:16, speed=st?st.speed:1.3, op=1;
      if(fx==="down"){op=.45;speed=speed?speed*2:0;w=Math.max(6,w-5)}
      if(fx==="up") w+=6;
      if(fx==="warn") c="#d99a00";
      const dim = sel!=null && !selected && !fx ? .4 : 1;
      return <g key={i} style={{opacity:op*dim,transition:"opacity .6s"}}>
        {selected && <path d={g.d} stroke={c} strokeWidth={w+34} fill="none" opacity=".22" filter="url(#soft)" strokeLinecap="round"/>}
        <path d={g.d} stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" opacity=".3" strokeDasharray={changed&&opt.style==="verbod"?"22 18":"none"} style={{transition:"all .8s"}}/>
        {speed>0 && <path d={g.d} stroke={c} strokeWidth={w*.75} fill="none" strokeLinecap="round" strokeDasharray="0 30" className="flowF" style={{animationDuration:speed+"s"}}/>}
        {speed>0 && <path d={g.d} stroke="#c9961a" strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray="0 30" strokeDashoffset="15" className="flowB" style={{animationDuration:(speed*1.3)+"s"}}/>}
        <path d={g.d} stroke="transparent" strokeWidth="120" fill="none" className="tap" onClick={()=>onLink(i)}/>
        {/* knop op de lijn */}
        <g className="tap" onClick={()=>onLink(i)}>
          {changed && phase==="direct" && <circle cx={g.lp.x} cy={g.lp.y} r="40" fill="none" stroke={c} strokeWidth="8" className="shock"/>}
          {(showPills||selected) && <>
            <circle cx={g.lp.x} cy={g.lp.y} r="38" fill={selected?c:"#fffcf6"} stroke={c} strokeWidth="5" style={{transition:"all .5s"}}/>
            <SvgIcon n={changed?st.icon:(selected?"link":"plus")} x={g.lp.x-20} y={g.lp.y-20} s={40} c={selected?"#fff":c} w={2.6}/>
          </>}
        </g>
      </g>;
    })}

    {/* knooppunten */}
    {["prod","verv","verk","cons"].map(k=>{
      const p=NODE_POS[k], fx=nodeFx[k], n=sub.nodes[k], ring=fx?KIND[fx].c:col;
      return <g key={k+(fx||"")} transform={`translate(${p.x},${p.y})`} style={{opacity:fx==="down"?.5:1,transition:"opacity .6s"}}>
        <g className={fx==="warn"?"shake":fx?"popSvg":""}>
          {(fx==="up"||fx==="warn") && <circle r="112" fill={KIND[fx].c} opacity=".25" filter="url(#soft)"/>}
          <circle r="82" fill="#fffcf6" stroke={ring} strokeWidth="7"/>
          <SvgIcon n={n.icon} x={-38} y={-40} s={76} c="#1f1a17" w={1.7}/>
        </g>
        {fx && <g transform="translate(62,-62)"><g className="popSvg"><circle r="30" fill={KIND[fx].c} stroke="#fffcf6" strokeWidth="5"/><SvgIcon n={KIND[fx].icon} x={-16} y={-16} s={32} c="#fff" w={3}/></g></g>}
        <text y="128" textAnchor="middle" fontSize="32" fontWeight="800" fill="#1f1a17" style={FONT_H}>{NODE_BASE[k].label}</text>
        <text y="160" textAnchor="middle" fontSize="21" fill="#5c5249" style={FONT_B}>{n.sub}</text>
      </g>;
    })}

    {illegal && <g transform={`translate(${NODE_POS.illegaal.x},${NODE_POS.illegaal.y})`}><g className="popSvg" style={{opacity:illegal.kind==="down"?.55:1}}>
      <circle r="74" fill="#fffcf6" stroke="#7a4fd0" strokeWidth="5" strokeDasharray="12 8"/>
      <SvgIcon n="route" x={-32} y={-32} s={64} c="#1f1a17" w={1.7}/>
      <g transform="translate(54,-54)"><circle r="26" fill={KIND[illegal.kind].c} stroke="#fffcf6" strokeWidth="5"/><SvgIcon n={KIND[illegal.kind].icon} x={-14} y={-14} s={28} c="#fff" w={3}/></g>
      <text y="110" textAnchor="middle" fontSize="26" fontWeight="800" fill="#4b2f99" style={FONT_H}>{illegal.label}</text>
      <text y="138" textAnchor="middle" fontSize="19" fill="#5c5249" style={FONT_B}>{illegal.kind==="down"?"wordt mogelijk kleiner":"nieuwe route"}</text>
    </g></g>}

    {/* labels als knoppen, alleen zolang er niets gekozen is (of het gekozen label) */}
    {LINKS.map((l,i)=>{ if(!(showPills||sel===i)) return null;
      const g=LG[i], on=sel===i, txt=linkName(i), w=txt.length*11.5+(on?40:84);
      return <g key={"lab"+i} className="tap" onClick={()=>onLink(i)} transform={`translate(${g.lp.x},${g.lp.y-84})`}>
        <g className={on?"":"bob"} style={{animationDelay:(i*.3)+"s"}}>
          {!on && <rect x={-w/2} y={-28} width={w} height={56} rx={28} fill="none" stroke={col} strokeWidth="3" className="ring" style={{animationDelay:(i*.5)+"s"}}/>}
          <rect x={-w/2} y={-28} width={w} height={56} rx={28} fill={on?col:"#fffcf6"} stroke={col} strokeWidth="3"/>
          {!on && <SvgIcon n="hand" x={-w/2+14} y={-15} s={30} c="#1f1a17" w={2}/>}
          <text x={on?0:20} y="8" textAnchor="middle" fontSize="22" fontWeight="700" fill={on?sub.on:"#1f1a17"} style={FONT_B}>{txt}</text>
        </g>
      </g>})}

    {pulse && <Pulse key={pulse.id} from={pulse.from} to={pulse.to} color={pulse.color}/>}
  </svg>;
}

/* ---------------- Uitleg-animatie ---------------- */
function Explainer({scenes,sub,inds,onClose}){
  const [i,setI]=useState(0),[paused,setPaused]=useState(false);
  const DUR=7000,last=scenes.length-1,color=sub.color;
  useEffect(()=>{if(paused||i>=last)return;const t=setTimeout(()=>setI(i+1),DUR);return()=>clearTimeout(t)},[i,paused]);
  const s=scenes[i];
  return <div className="ov">
    <div className="ex">
      <div className="bars">{scenes.map((_,k)=><div key={k} className={k<i?"done":k===i?("cur"+(paused||i===last?" paused":"")):""}><i key={i} style={{animationDuration:DUR+"ms",width:k===i&&i===last?"100%":undefined}}/></div>)}</div>
      <div className="scene" key={i}>
        <span className="sTag">{s.tag}</span>
        {s.summary ? <>
          <div className="sTitle h">{s.title}</div>
          <div className="sumGrid">{Object.entries(inds).map(([k,v],n)=>
            <div key={k} className="sum" style={{"--k":KIND[v].c,animationDelay:(n*.2)+"s"}}>
              <span className="si"><Icon n={IND[k].icon} s={38} c="#fff" w={2}/></span>
              <div><b>{IND[k].label}</b><span>{v==="mix"?"onzeker":"mogelijk "+IND[k][v]}</span></div>
              <span style={{marginLeft:"auto"}}><Icon n={KIND[v].icon} s={44} c={KIND[v].c} w={2.8}/></span>
            </div>)}</div>
        </> : <>
          <div className="items">
            {s.items.map((it,k)=>[
              k>0 && <svg key={"a"+k} className="arrow" viewBox="0 0 140 40" style={{animationDelay:(k*.45-.2)+"s"}}><path className="dash" d="M8 20H116" stroke={color} strokeWidth="9" strokeLinecap="round" strokeDasharray="2 18" fill="none"/><path d="M108 8l16 12-16 12" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>,
              <div key={k} className="item" style={{animationDelay:(k*.45)+"s"}}>
                <div className={"bub"+(it.float?" float":"")} style={{"--bc":it.badge?KIND[it.badge].c:(it.color||color)}}>
                  <Icon n={it.icon} s={96} c={it.color||"#1f1a17"} w={1.6}/>
                  {it.badge && <div className="bd" style={{background:KIND[it.badge].c,animationDelay:(k*.45+.5)+"s"}}><Icon n={KIND[it.badge].icon} s={36} c="#fff" w={3}/></div>}
                </div>
                <span>{it.label}</span>
              </div>])}
          </div>
          <div className="sTitle h">{s.title}</div>
          <div className="sText">{s.text}</div>
        </>}
      </div>
      <div className="exBot">
        <div className="disc"><Icon n="alert" s={30} c="#a06e00"/>Mogelijk scenario, geen voorspelling</div>
        <button className="nb" onClick={()=>setI(Math.max(0,i-1))} aria-label="Vorige" disabled={i===0} style={{opacity:i===0?.4:1}}><Icon n="left" s={36}/></button>
        {i<last && <button className="nb" onClick={()=>setPaused(p=>!p)}>{paused?<><Icon n="play" s={26}/>Verder</>:"Pauze"}</button>}
        {i<last ? <button className="nb pri" onClick={()=>setI(i+1)}>Volgende<Icon n="right" s={32}/></button>
                : <button className="nb pri" onClick={onClose}>Verder<Icon n="right" s={32}/></button>}
      </div>
    </div>
  </div>;
}

/* ---------------- Startscherm ---------------- */
function Start({onPick}){
  return <div className="start">
    <div className="kicker">DOPE · De Perspectiefexpeditie</div>
    <div className="mega h">Volg het <em>middel</em></div>
    <div className="lead">Wat gebeurt er als een regel verandert?<br/>Kies een middel om te beginnen.</div>
    <div className="cards">
      {Object.entries(SUBS).map(([k,s],i)=>
        <button key={k} className="card" style={{"--c":s.color,animationDelay:(i*.12)+"s"}} onClick={()=>onPick(k)}>
          <div className="ci"><Icon n={s.icon} s={100} c={s.on} w={1.7}/></div>
          <b className="h">{s.name}</b>
          <span>{s.status}</span>
        </button>)}
    </div>
    <div className="foot">Prototype · alle regelteksten en gevolgen zijn voorbeeldinhoud</div>
  </div>;
}

/* ---------------- App ---------------- */
const STEPS={start:[1,"Kies een middel"],net:[2,"Kies een verbinding"],rule:[3,"De huidige regel"],choose:[4,"Kies een nieuwe regel"],direct:[5,"Domino-effect"],further:[5,"Domino-effect"],explain:[6,"Gevolgen voor de samenleving"],end:[7,"Verder onderzoeken"]};
const IDLE_MS=120000;

function App(){
  const navigate=useNavigate(); // toegevoegd voor de gezamenlijke website
  const [scale,setScale]=useState(1),[off,setOff]=useState({x:0,y:0});
  useEffect(()=>{const f=()=>{const s=Math.min(innerWidth/1920,innerHeight/1080);setScale(s);setOff({x:(innerWidth-1920*s)/2,y:(innerHeight-1080*s)/2})};f();addEventListener("resize",f);return()=>removeEventListener("resize",f)},[]);

  const [subKey,setSubKey]=useState("alcohol");
  const [phase,setPhase]=useState("start"); // start net rule choose direct further explain end
  const [sel,setSel]=useState(null);
  const [optId,setOptId]=useState(null);
  const [revealed,setRevealed]=useState(0);
  const [busy,setBusy]=useState(false);
  const [pulse,setPulse]=useState(null);
  const timers=useRef([]);
  const clearT=()=>{timers.current.forEach(clearTimeout);timers.current=[]};
  const later=(ms,f)=>timers.current.push(setTimeout(f,ms));

  const sub=SUBS[subKey];
  const opt = sel!=null && optId ? sub.links[sel].options.find(o=>o.id===optId) : null;
  const effs=effectsOf(opt);
  const isFull = subKey==="alcohol" && sel===1;

  const {nodeFx,linkFx,illegal,inds}=useMemo(()=>{
    const nodeFx={},linkFx={},inds={};let illegal=null;
    effs.slice(0,revealed).forEach(e=>{
      if(e.target.startsWith("link")) linkFx[+e.target.slice(4)]=e.kind;
      else if(e.target==="illegaal") illegal={kind:e.kind,label:e.newLabel||sub.illegalLabel};
      else nodeFx[e.target]=e.kind;
      Object.assign(inds,e.ind);
    });
    return {nodeFx,linkFx,illegal,inds};
  },[revealed,optId,sel,subKey]);

  const clearChange=()=>{clearT();setOptId(null);setRevealed(0);setPulse(null);setBusy(false)};
  const goStart=()=>{clearChange();setSel(null);setPhase("start")};
  const pickSub=k=>{clearChange();setSel(null);setSubKey(k);setPhase("net")};
  const onLink=i=>{ if(busy) return; if(i===sel && (phase==="rule"||phase==="choose")) return; clearChange();setSel(i);setPhase("rule")};

  const runSteps=(list,startIdx,fromPos)=>{
    setBusy(true); let prev=fromPos, t=600;
    list.forEach((e,n)=>{const i=startIdx+n, from=prev, to=posOf(e.target);
      later(t,()=>setPulse({id:i,from,to,color:KIND[e.kind].c}));
      later(t+820,()=>setRevealed(i+1));
      prev=to; t+=1900;});
    later(t-700,()=>{setPulse(null);setBusy(false)});
  };
  const choose=o=>{clearChange();setOptId(o.id);setPhase("direct");runSteps([o.direct],0,LG[sel].lp)};
  const showFurther=()=>{setPhase("further");runSteps(opt.further,1,posOf(opt.direct.target))};

  // terug naar start na inactiviteit
  const idle=useRef();
  useEffect(()=>{const reset=()=>{clearTimeout(idle.current);idle.current=setTimeout(()=>{goStart()},IDLE_MS)};
    addEventListener("pointerdown",reset);reset();return()=>{removeEventListener("pointerdown",reset);clearTimeout(idle.current)}},[]);
  useEffect(()=>clearT,[]);

  const [stepN,stepT]=STEPS[phase];
  const panelOpen = sel!=null && phase!=="net";
  const bg = phase==="start"
    ? "radial-gradient(900px 600px at 15% 90%, #e08a1e1c, transparent 60%), radial-gradient(900px 600px at 50% 110%, #2e9a5818, transparent 60%), radial-gradient(900px 600px at 88% 85%, #cc3f861a, transparent 60%)"
    : `radial-gradient(1100px 700px at 30% 45%, ${sub.color}1c, transparent 60%)`;

  return <div className="stage" style={{transform:`translate(${off.x}px,${off.y}px) scale(${scale})`,"--c":sub.color,"--on":sub.on}}>
    <div className="bg" style={{background:bg}}/>

    {phase==="start" ? <Start onPick={pickSub}/> : <>
      <div className="top">
        <div className="brand"><small>DOPE · De Perspectiefexpeditie</small><b className="h">Volg het middel</b></div>
        <div className="stepPill" key={stepN}>
          <span className="n">{stepN}</span>
          <span className="t">{stepT}<span className="of"> · stap {stepN} van 7</span></span>
        </div>
        <div className="subChip"><span className="d"><Icon n={sub.icon} s={30} c={sub.on}/></span>{sub.name}</div>
        <button className="homeBtn" onClick={goStart}><Icon n="grid" s={28}/>Opnieuw</button>
      </div>

      <div className="net" style={{left:panelOpen?40:330}}>
        <Network sub={sub} sel={sel} onLink={onLink} opt={opt} nodeFx={nodeFx} linkFx={linkFx} illegal={illegal} pulse={pulse} phase={phase}/>
      </div>

      {phase==="net" && <div className="hint"><div><span className="hi"><Icon n="hand" s={34} c={sub.on}/></span>Tik op een verbinding tussen twee onderdelen</div></div>}
      <div className="legend"><div><span style={{background:sub.color}}/>{sub.name} gaat naar de consument</div><div><span style={{background:"#c9961a"}}/>Geld gaat terug</div></div>

      {panelOpen && <div className="panel">
        {phase==="rule" && <div className="pv" key="rule">
          <button className="back" onClick={()=>{setSel(null);setPhase("net")}}><Icon n="left" s={28}/>Terug</button>
          <div className="linkTitle"><span className="li"><Icon n="link" s={36} c={sub.on}/></span><b className="h">{linkName(sel)}</b></div>
          <div className="ruleBox">
            <div className="lab">Zo is het nu</div>
            <p>{sub.links[sel].current}</p>
            <span className="sample"><Icon n="alert" s={18} c="#8a5a00"/>Voorbeeldtekst, nog te controleren</span>
          </div>
          <button className="big pulse" onClick={()=>setPhase("choose")}>Verander deze regel<Icon n="right" s={34} c={sub.on}/></button>
        </div>}

        {phase==="choose" && <div className="pv" key="choose">
          <button className="back" onClick={()=>setPhase("rule")}><Icon n="left" s={28}/>Terug</button>
          <div className="ptitle h">Wat wordt de nieuwe regel?</div>
          <div style={{fontSize:22,color:"#5c5249",marginTop:10}}>{linkName(sel)}</div>
          <div style={{marginTop:14}}>
            {sub.links[sel].options.map(o=>{const st=STYLE[o.style];const c=st.c||sub.color;
              return <button key={o.id} className="opt" onClick={()=>choose(o)} style={{borderColor:c+"66"}}>
                <span className="oi" style={{background:c}}><Icon n={st.icon} s={40} c="#fff" w={2.3}/></span>
                <span><b>{o.label}</b><small>{o.short}</small></span>
              </button>})}
          </div>
          {!isFull && <div style={{marginTop:"auto",fontSize:18,color:"#8a7e72"}}>Vereenvoudigd voorbeeldscenario</div>}
        </div>}

        {phase==="direct" && <div className="pv" key="direct">
          <div className="lab">{linkName(sel)}</div>
          <div className="ruleNew"><span className="ri" style={{background:STYLE[opt.style].c||sub.color}}><Icon n={STYLE[opt.style].icon} s={30} c="#fff" w={2.3}/></span>
            <div><div style={{fontSize:17,color:"#5c5249",fontWeight:700,textTransform:"uppercase",letterSpacing:".08em"}}>Nieuwe regel</div><b>{opt.label}</b></div></div>
          {revealed>=1 ? <div className="fxCard" style={{"--k":KIND[opt.direct.kind].c}}>
              <div className="row"><span className="fi"><Icon n={KIND[opt.direct.kind].icon} s={32} c="#fff" w={2.8}/></span><span className="lab">Direct gevolg</span></div>
              <b className="h">{opt.direct.title}</b><p>{opt.direct.text}</p>
            </div>
            : <div className="waiting"><i/><i/><i/>De regel verandert…</div>}
          <button className={"big"+(busy?"":" pulse")} disabled={busy} onClick={showFurther}>Wat gebeurt er daarna?<Icon n="right" s={34} c={sub.on}/></button>
        </div>}

        {phase==="further" && <div className="pv" key="further">
          <div className="lab">{opt.label}</div>
          <div className="ptitle h" style={{fontSize:40}}>Mogelijke vervolgstappen</div>
          <div style={{marginTop:14}}>
            {opt.further.slice(0,Math.max(0,revealed-1)).map((e,n)=>{const ti=targetInfo(e.target,sub);
              return <div key={n} className="fxRow"><span className="fi" style={{background:KIND[e.kind].c}}><Icon n={KIND[e.kind].icon} s={28} c="#fff" w={2.8}/></span>
                <div><small>{e.newLabel||ti.label}</small><b>{e.title}</b></div></div>})}
            {busy && <div className="waiting"><i/><i/><i/>Het effect verspreidt zich…</div>}
          </div>
          <button className={"big"+(busy?"":" pulse")} disabled={busy} onClick={()=>setPhase("explain")}><Icon n="play" s={30} c={sub.on}/>Bekijk de gevolgen</button>
        </div>}

        {(phase==="end"||phase==="explain") && <div className="pv" key="end">
          <div className="ptitle h">Wat wil je nu doen?</div>
          <div style={{marginTop:18}}>
            <button className="endBtn" onClick={()=>{const k=sel;clearChange();setSel(k);setPhase("rule")}}><span className="ei"><Icon n="refresh" s={36} c={sub.on}/></span>Zet de regel terug</button>
            <button className="endBtn" onClick={()=>{clearChange();setSel(null);setPhase("net")}}><span className="ei"><Icon n="link" s={36} c={sub.on}/></span>Kies een andere verbinding</button>
            <button className="endBtn" onClick={goStart}><span className="ei"><Icon n="grid" s={36} c={sub.on}/></span>Kies een ander middel</button>
          </div>
          <button className="linkBtn" onClick={()=>setPhase("explain")}><Icon n="play" s={22}/>Bekijk de uitleg opnieuw</button>
        </div>}
      </div>}

      <div className="proto">Prototype v2 · voorbeeldinhoud</div>
      {phase==="explain" && opt && <Explainer scenes={buildScenes(sub,sel,opt)} sub={sub} inds={inds} onClose={()=>setPhase("end")}/>}
    </>}

    {/* Toegevoegd voor de gezamenlijke website */}
    <button className={"siteHome "+(phase==="start"?"atStart":"inApp")} onClick={()=>navigate("/")}><Icon n="left" s={26}/>Terug naar startscherm</button>
  </div>;
}

/* Ingang voor de gezamenlijke website (was: #root met position:fixed) */
export default function Zone2(){
  return <div className="z2"><App/></div>;
}
