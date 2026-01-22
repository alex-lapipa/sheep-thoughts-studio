import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const DeletionRequestForm = () => {
  const { language } = useLanguage();
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !confirmed) {
      toast.error(language === "es" ? "Por favor complete todos los campos requeridos" : "Please complete all required fields");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(language === "es" ? "Por favor ingrese un email válido" : "Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('deletion_requests')
        .insert({
          email: email.toLowerCase().trim(),
          reason: reason.trim() || null,
          metadata: {
            language,
            submitted_from: window.location.href,
            user_agent: navigator.userAgent,
          }
        });

      if (error) throw error;

      setSubmitted(true);
      toast.success(
        language === "es" 
          ? "Solicitud enviada. Procesaremos tu solicitud dentro de 30 días." 
          : "Request submitted. We'll process your request within 30 days."
      );
    } catch (error) {
      console.error("Error submitting deletion request:", error);
      toast.error(
        language === "es" 
          ? "Error al enviar la solicitud. Inténtalo de nuevo." 
          : "Failed to submit request. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="border-green-500/30 bg-green-500/5">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center gap-4">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <div>
              <h3 className="font-display font-bold text-lg mb-2">
                {language === "es" ? "Solicitud Recibida" : "Request Received"}
              </h3>
              <p className="text-muted-foreground text-sm">
                {language === "es" 
                  ? "Tu solicitud de eliminación de datos ha sido registrada. Procesaremos tu solicitud dentro de 30 días según el RGPD Artículo 17."
                  : "Your data deletion request has been logged. We'll process your request within 30 days as required by GDPR Article 17."}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {language === "es" 
                  ? `Se enviará una confirmación a ${email}`
                  : `A confirmation will be sent to ${email}`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <Trash2 className="h-5 w-5 text-destructive" />
          {language === "es" ? "Solicitar Eliminación de Datos" : "Request Data Deletion"}
        </CardTitle>
        <CardDescription>
          {language === "es" 
            ? "Bajo el RGPD Artículo 17, tienes derecho a solicitar la eliminación de tus datos personales."
            : "Under GDPR Article 17, you have the right to request deletion of your personal data."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deletion-email">
              {language === "es" ? "Tu Email *" : "Your Email *"}
            </Label>
            <Input
              id="deletion-email"
              type="email"
              placeholder={language === "es" ? "email@ejemplo.com" : "email@example.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              {language === "es" 
                ? "El email asociado con tus datos"
                : "The email associated with your data"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deletion-reason">
              {language === "es" ? "Razón (opcional)" : "Reason (optional)"}
            </Label>
            <Textarea
              id="deletion-reason"
              placeholder={language === "es" 
                ? "Cuéntanos por qué solicitas la eliminación..."
                : "Tell us why you're requesting deletion..."}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-700 dark:text-amber-400 mb-1">
                  {language === "es" ? "Importante" : "Important"}
                </p>
                <p className="text-muted-foreground">
                  {language === "es" 
                    ? "La eliminación de datos es permanente. Se eliminarán todos los datos asociados con tu email, incluyendo historial de preguntas, preferencias y cualquier contenido enviado."
                    : "Data deletion is permanent. All data associated with your email will be removed, including question history, preferences, and any submitted content."}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="deletion-confirm"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked === true)}
              disabled={isSubmitting}
            />
            <Label htmlFor="deletion-confirm" className="text-sm leading-relaxed cursor-pointer">
              {language === "es" 
                ? "Entiendo que esta acción es irreversible y todos mis datos serán eliminados permanentemente."
                : "I understand this action is irreversible and all my data will be permanently deleted."}
            </Label>
          </div>

          <Button 
            type="submit" 
            variant="destructive" 
            className="w-full"
            disabled={isSubmitting || !confirmed || !email}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {language === "es" ? "Enviando..." : "Submitting..."}
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                {language === "es" ? "Enviar Solicitud de Eliminación" : "Submit Deletion Request"}
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            {language === "es" 
              ? "Procesaremos tu solicitud dentro de 30 días y te notificaremos por email."
              : "We'll process your request within 30 days and notify you via email."}
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
