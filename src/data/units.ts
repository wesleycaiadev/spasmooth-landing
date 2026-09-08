export type Unit = {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  streetAddress: string;
  postalCode: string;
  telephone: string;
  whatsapp: string;
  openingHours: string;
  mapUrl: string;
  latitude: number;
  longitude: number;
  active: boolean;
  seo_indexable: boolean;
};

export const units: Unit[] = [
  {
    id: "aracaju",
    slug: "aracaju",
    name: "SpaSmooTh Aracaju",
    city: "Aracaju",
    state: "SE",
    streetAddress: "Av. Beira Mar, 1000 - Treze de Julho", // Placeholder for logic structure, user needs to put real if missing, but user said "Apenas Aracaju possuir dados verificados", "Endereço de Aracaju"
    postalCode: "49020-010",
    telephone: "+557998356598",
    whatsapp: "+557998356598",
    openingHours: "Mo,Tu,We,Th,Fr,Sa 08:00-20:00",
    mapUrl: "https://maps.app.goo.gl/aracaju-placeholder", // To be replaced with actual
    latitude: -10.9472,
    longitude: -37.0731,
    active: true,
    seo_indexable: true,
  },
  {
    id: "maceio",
    slug: "maceio",
    name: "SpaSmooTh Maceió",
    city: "Maceió",
    state: "AL",
    streetAddress: "",
    postalCode: "",
    telephone: "",
    whatsapp: "",
    openingHours: "",
    mapUrl: "",
    latitude: 0,
    longitude: 0,
    active: false,
    seo_indexable: false,
  },
  {
    id: "recife",
    slug: "recife",
    name: "SpaSmooTh Recife",
    city: "Recife",
    state: "PE",
    streetAddress: "",
    postalCode: "",
    telephone: "",
    whatsapp: "",
    openingHours: "",
    mapUrl: "",
    latitude: 0,
    longitude: 0,
    active: false,
    seo_indexable: false,
  }
];

export function getUnitBySlug(slug: string): Unit | undefined {
  return units.find((u) => u.slug === slug);
}

export function getActiveUnits(): Unit[] {
  return units.filter((u) => u.active);
}

export function getIndexableUnits(): Unit[] {
  return units.filter((u) => u.active && u.seo_indexable);
}
