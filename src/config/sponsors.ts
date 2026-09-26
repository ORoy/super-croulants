import blaxtonLogo from "../assets/sponsors/blaxton.webp";
import assuranciaLogo from "../assets/sponsors/assurancia-groupe-tardif.png";
import leGourmetLogo from "../assets/sponsors/le-gourmet.png";

// Hardcoded on purpose: sponsors change rarely and there's no sheet/backend
// for them. Edit this list directly to add, remove, or update a sponsor.
export interface Sponsor {
  name: string;
  logoUrl?: string;
  link?: string;
}

export const sponsors: Sponsor[] = [
  { name: "Blaxton", logoUrl: blaxtonLogo, link: "https://blaxton.com/" },
  { name: "Assurancia Groupe Tardif", logoUrl: assuranciaLogo, link: "https://www.assuranciagt.com/bureau/quebec/" },
  { name: "Le Gourmet traiteur", logoUrl: leGourmetLogo, link: "https://www.le-gourmet.ca/" },
];
