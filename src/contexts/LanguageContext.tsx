import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "es";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    "nav.home": "Home",
    "nav.facts": "Facts",
    "nav.shop": "Shop",
    "nav.story": "My Story",
    "nav.questions": "Questions",
    
    // Hero
    "hero.location": "Broadcasting from Sugarloaf Mountain, Wicklow",
    "hero.title.intro": "I'm",
    "hero.title.name": "Bubbles",
    "hero.title.tagline": "I know things.",
    "hero.subtitle": "A sheep. An expert. A trusted source of information that is absolutely, definitely, probably correct.",
    "hero.cta.merch": "Official Merch",
    "hero.cta.learn": "Learn From Me",
    
    // About Section
    "about.title": "The Most Informed Sheep in Ireland",
    "about.p1": "I live on Sugarloaf Mountain in County Wicklow. I spend my days eating grass and researching important topics. The internet has taught me many things. The mist whispers secrets. I have connected the dots that others refuse to see.",
    "about.p2": "My thoughts appear in bubbles above my head. This is normal. All sheep have this. You just can't see theirs because they don't know as much as me.",
    
    // Credentials
    "credentials.title": "My Qualifications",
    "credentials.staring.title": "Years of Staring",
    "credentials.staring.desc": "At the horizon. Thinking. Processing. Understanding things.",
    "credentials.facts.title": "Facts Discovered",
    "credentials.facts.desc": "I cannot count. But it's definitely a lot. Trust me.",
    "credentials.brain.title": "Sheep Brain",
    "credentials.brain.desc": "It's bigger than it looks. The wool hides the extra brain.",
    
    // Shop CTA
    "shop.title": "Wear My Thoughts",
    "shop.subtitle": "Premium apparel featuring my most important observations. Each purchase supports my research into whether clouds are real.",
    "shop.cta": "Visit the Shop",

    // Irish flavor
    "irish.grand": "Grand",
    "irish.fierce": "Fierce",
  },
  es: {
    // Nav
    "nav.home": "Inicio",
    "nav.facts": "Datos",
    "nav.shop": "Tienda",
    "nav.story": "Mi Historia",
    "nav.questions": "Preguntas",
    
    // Hero
    "hero.location": "Transmitiendo desde la Montaña Sugarloaf, Wicklow",
    "hero.title.intro": "Soy",
    "hero.title.name": "Bubbles",
    "hero.title.tagline": "Sé cosas.",
    "hero.subtitle": "Una oveja. Una experta. Una fuente confiable de información que es absolutamente, definitivamente, probablemente correcta.",
    "hero.cta.merch": "Mercancía Oficial",
    "hero.cta.learn": "Aprende de Mí",
    
    // About Section
    "about.title": "La Oveja Más Informada de Irlanda",
    "about.p1": "Vivo en la Montaña Sugarloaf en el Condado de Wicklow. Paso mis días comiendo hierba e investigando temas importantes. Internet me ha enseñado muchas cosas. La niebla susurra secretos. He conectado los puntos que otros se niegan a ver.",
    "about.p2": "Mis pensamientos aparecen en burbujas sobre mi cabeza. Esto es normal. Todas las ovejas tienen esto. Simplemente no puedes ver las suyas porque no saben tanto como yo.",
    
    // Credentials
    "credentials.title": "Mis Calificaciones",
    "credentials.staring.title": "Años Mirando",
    "credentials.staring.desc": "Al horizonte. Pensando. Procesando. Entendiendo cosas.",
    "credentials.facts.title": "Datos Descubiertos",
    "credentials.facts.desc": "No sé contar. Pero definitivamente son muchos. Confía en mí.",
    "credentials.brain.title": "Cerebro de Oveja",
    "credentials.brain.desc": "Es más grande de lo que parece. La lana esconde el cerebro extra.",
    
    // Shop CTA
    "shop.title": "Usa Mis Pensamientos",
    "shop.subtitle": "Ropa premium con mis observaciones más importantes. Cada compra apoya mi investigación sobre si las nubes son reales.",
    "shop.cta": "Visitar la Tienda",

    // Irish flavor
    "irish.grand": "Genial",
    "irish.fierce": "Feroz",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("bubbles-language");
    return (saved === "es" ? "es" : "en") as Language;
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("bubbles-language", lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
