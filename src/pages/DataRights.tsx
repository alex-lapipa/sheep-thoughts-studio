import { Layout } from "@/components/Layout";
import { DataExportCard } from "@/components/DataExportCard";
import { DeletionRequestForm } from "@/components/DeletionRequestForm";
import { useLanguage } from "@/contexts/LanguageContext";
import { Shield, FileText, Scale } from "lucide-react";
import { Link } from "react-router-dom";

export default function DataRights() {
  const { language } = useLanguage();

  return (
    <Layout>
      <div className="container py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-6">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-display font-bold mb-4">
            {language === "es" ? "Tus Derechos de Datos" : "Your Data Rights"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === "es" 
              ? "Bubbles cree que tus datos te pertenecen. (Aunque también cree que las nubes son ovejas que fallaron hacia arriba.)"
              : "Bubbles believes your data belongs to you. (Bubbles also believes clouds are sheep that failed upwards.)"}
          </p>
        </div>

        {/* GDPR Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-card border rounded-xl p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-500/10 rounded-lg shrink-0">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-display font-semibold mb-2">
                  {language === "es" ? "Artículo 15 - Derecho de Acceso" : "Article 15 - Right of Access"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === "es" 
                    ? "Tienes derecho a saber qué datos tenemos sobre ti y cómo los usamos."
                    : "You have the right to know what data we hold about you and how we use it."}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-xl p-6 animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <div className="flex items-start gap-4">
              <div className="p-2 bg-green-500/10 rounded-lg shrink-0">
                <Scale className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-display font-semibold mb-2">
                  {language === "es" ? "Artículo 17 - Derecho al Olvido" : "Article 17 - Right to Erasure"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === "es" 
                    ? "Puedes solicitar que eliminemos tus datos personales de forma permanente."
                    : "You can request that we permanently delete your personal data."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Export Section */}
        <section className="mb-12 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-3">
            <span className="text-3xl">📦</span>
            {language === "es" ? "Exportar Tus Datos" : "Export Your Data"}
          </h2>
          <DataExportCard />
        </section>

        {/* Deletion Request Section */}
        <section className="mb-12 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-3">
            <span className="text-3xl">🗑️</span>
            {language === "es" ? "Eliminar Tus Datos" : "Delete Your Data"}
          </h2>
          <DeletionRequestForm />
        </section>

        {/* Additional Info */}
        <div className="bg-muted/30 rounded-xl p-6 border animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <h3 className="font-display font-semibold mb-4">
            {language === "es" ? "¿Necesitas Más Ayuda?" : "Need More Help?"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {language === "es" 
              ? "Si tienes preguntas sobre tus datos o derechos de privacidad, puedes:"
              : "If you have questions about your data or privacy rights, you can:"}
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-primary">•</span>
              <Link to="/privacy" className="text-primary hover:underline">
                {language === "es" ? "Leer nuestra Política de Privacidad" : "Read our Privacy Policy"}
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">•</span>
              <Link to="/contact" className="text-primary hover:underline">
                {language === "es" ? "Contactarnos directamente" : "Contact us directly"}
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">•</span>
              <Link to="/faq" className="text-primary hover:underline">
                {language === "es" ? "Revisar nuestras Preguntas Frecuentes" : "Check our FAQ"}
              </Link>
            </li>
          </ul>

          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground italic">
              {language === "es" 
                ? "\"He leído todas las leyes del RGPD. Creo que significa que las ovejas tenemos derechos sobre nuestros datos de lana también.\" — Bubbles"
                : "\"I've read all the GDPR laws. I believe it means sheep have rights over our wool data too.\" — Bubbles"}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
