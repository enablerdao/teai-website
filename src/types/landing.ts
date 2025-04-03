export interface Feature {
  name: string;
  description: string;
  icon: React.ReactNode; // または JSX.Element
}

export interface Plan {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
} 