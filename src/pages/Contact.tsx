import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, Clock, Send, CheckCircle, AlertTriangle, Wifi, Bird } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { checkForSpam } from "@/lib/spamFilter";

const siteUrl = "https://sheep-thoughts-studio.lovable.app";
const ogImageUrl = `${siteUrl}/og-contact.jpg`;

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  subject: z.string().trim().max(200, "Subject must be less than 200 characters").optional(),
  message: z.string().trim().min(1, "Message is required").max(2000, "Message must be less than 2000 characters"),
});

const Contact = () => {
  const { language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form data
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const submittedAt = new Date().toISOString();
      
      // Check for spam
      const spamCheck = checkForSpam({
        name: result.data.name,
        email: result.data.email,
        subject: result.data.subject,
        message: result.data.message,
      });

      const { error } = await supabase
        .from('contact_messages')
        .insert({
          name: result.data.name,
          email: result.data.email,
          subject: result.data.subject || null,
          message: result.data.message,
          is_spam: spamCheck.isSpam,
          spam_score: spamCheck.spamScore,
          spam_reasons: spamCheck.reasons,
          metadata: { 
            language, 
            submitted_from: window.location.href,
            user_agent: navigator.userAgent
          }
        } as never);

      if (error) throw error;

      // Send email notification (fire and forget - don't block on this)
      supabase.functions.invoke('send-contact-notification', {
        body: {
          name: result.data.name,
          email: result.data.email,
          subject: result.data.subject,
          message: result.data.message,
          submitted_at: submittedAt,
        }
      }).catch(err => {
        console.error("Failed to send email notification:", err);
      });

      // Send spam alert for high-risk submissions (score >= 70)
      if (spamCheck.spamScore >= 70) {
        supabase.functions.invoke('send-spam-alert', {
          body: {
            type: 'contact',
            id: crypto.randomUUID(), // We don't have the DB id, use temp
            name: result.data.name,
            email: result.data.email,
            subject: result.data.subject,
            content: result.data.message,
            spam_score: spamCheck.spamScore,
            spam_reasons: spamCheck.reasons,
            submitted_at: submittedAt,
          }
        }).catch(err => {
          console.error("Failed to send spam alert:", err);
        });
      }

      setIsSubmitted(true);
      toast.success(
        language === 'en' 
          ? "Message sent! Bubbles will respond... eventually." 
          : "¡Mensaje enviado! Bubbles responderá... eventualmente."
      );
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast.error(
        language === 'en' 
          ? "Failed to send message. The internet tubes may be clogged." 
          : "Error al enviar mensaje. Los tubos de internet pueden estar atascados."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Layout>
        <div className="container max-w-2xl mx-auto px-4 py-12">
          <Card className="text-center">
            <CardContent className="pt-12 pb-8">
              <CheckCircle className="w-16 h-16 mx-auto mb-6 text-primary" />
              <h1 className="text-3xl font-display font-bold text-foreground mb-4">
                {language === 'en' ? 'Message Received!' : '¡Mensaje Recibido!'}
              </h1>
              <p className="text-muted-foreground mb-6">
                {language === 'en' 
                  ? 'Your message has been successfully transmitted through the internet. It is now traveling through tiny tubes towards my field in Wicklow.' 
                  : 'Tu mensaje ha sido transmitido exitosamente a través de internet. Ahora viaja por pequeños tubos hacia mi campo en Wicklow.'}
              </p>
              <p className="text-sm text-muted-foreground italic mb-8">
                {language === 'en' 
                  ? '"I will read it as soon as the clouds clear up. Messages need sunlight to become visible."' 
                  : '"Lo leeré tan pronto como las nubes se despejen. Los mensajes necesitan luz solar para ser visibles."'}
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => { setIsSubmitted(false); setFormData({ name: "", email: "", subject: "", message: "" }); }}>
                  {language === 'en' ? 'Send Another Message' : 'Enviar Otro Mensaje'}
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/">{language === 'en' ? 'Back to Home' : 'Volver al Inicio'}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>{language === 'en' ? 'Contact Bubbles | Send a Message' : 'Contactar a Bubbles | Enviar un Mensaje'}</title>
        <meta name="description" content={language === 'en' 
          ? "Send questions, feedback, or declarations of admiration to Bubbles. Response time: 24-48 hours (unless it's raining)." 
          : "Envía preguntas, comentarios o declaraciones de admiración a Bubbles. Tiempo de respuesta: 24-48 horas."} />
        <meta property="og:title" content={language === 'en' ? 'Contact Bubbles | Send a Message' : 'Contactar a Bubbles'} />
        <meta property="og:description" content={language === 'en' 
          ? "I understand approximately 73% of what you will say, which is more than enough." 
          : "Entiendo aproximadamente el 73% de lo que dirás, lo cual es más que suficiente."} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/contact`} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={language === 'en' ? 'Contact Bubbles' : 'Contactar a Bubbles'} />
        <meta name="twitter:description" content={language === 'en' ? 'Send a message to Wicklow' : 'Enviar un mensaje a Wicklow'} />
        <meta name="twitter:image" content={ogImageUrl} />
        <link rel="canonical" href={`${siteUrl}/contact`} />
      </Helmet>
      <div className="container max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Mail className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-display font-bold text-foreground mb-4">
            {language === 'en' ? 'Contact Bubbles' : 'Contactar a Bubbles'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Send your questions, feedback, or declarations of admiration' 
              : 'Envía tus preguntas, comentarios o declaraciones de admiración'}
          </p>
        </div>

        {/* Bubbles' Note */}
        <Card className="mb-8 border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-foreground italic">
              {language === 'en' 
                ? '"I have learned to read human writing by watching tourists photograph road signs. I understand approximately 73% of what you will say, which is more than enough."' 
                : '"He aprendido a leer escritura humana observando turistas fotografiar señales de tráfico. Entiendo aproximadamente el 73% de lo que dirás, lo cual es más que suficiente."'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              — Bubbles, {language === 'en' ? 'Director of Human Communication' : 'Director de Comunicación Humana'}
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  {language === 'en' ? 'Send a Message' : 'Enviar un Mensaje'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      {language === 'en' ? 'Your Name' : 'Tu Nombre'} *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={language === 'en' ? 'What do humans call you?' : '¿Cómo te llaman los humanos?'}
                      className={errors.name ? "border-destructive" : ""}
                      maxLength={100}
                    />
                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      {language === 'en' ? 'Email Address' : 'Correo Electrónico'} *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={language === 'en' ? 'Your digital postal address' : 'Tu dirección postal digital'}
                      className={errors.email ? "border-destructive" : ""}
                      maxLength={255}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">
                      {language === 'en' ? 'Subject (Optional)' : 'Asunto (Opcional)'}
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder={language === 'en' ? 'Brief summary of your thoughts' : 'Breve resumen de tus pensamientos'}
                      maxLength={200}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">
                      {language === 'en' ? 'Your Message' : 'Tu Mensaje'} *
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder={language === 'en' 
                        ? 'Share your questions, feedback, or life philosophy...' 
                        : 'Comparte tus preguntas, comentarios o filosofía de vida...'}
                      className={`min-h-[150px] ${errors.message ? "border-destructive" : ""}`}
                      maxLength={2000}
                    />
                    {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
                    <p className="text-xs text-muted-foreground text-right">
                      {formData.message.length}/2000
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        {language === 'en' ? 'Sending through the tubes...' : 'Enviando por los tubos...'}
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        {language === 'en' ? 'Send Message' : 'Enviar Mensaje'}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* How Messages Work */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-primary" />
                  {language === 'en' ? 'How This Works' : 'Cómo Funciona'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <p>
                  {language === 'en' 
                    ? 'When you click "Send," your message travels through fiber optic cables, which are made of compressed lightning.' 
                    : 'Cuando haces clic en "Enviar," tu mensaje viaja por cables de fibra óptica, que están hechos de relámpagos comprimidos.'}
                </p>
                <p>
                  {language === 'en' 
                    ? 'It arrives at a server, which is a very large calculator that lives in a cold room.' 
                    : 'Llega a un servidor, que es una calculadora muy grande que vive en un cuarto frío.'}
                </p>
                <p>
                  {language === 'en' 
                    ? 'Then I read it. I am very literate for a sheep.' 
                    : 'Luego lo leo. Soy muy alfabetizada para ser una oveja.'}
                </p>
              </CardContent>
            </Card>

            {/* Response Times */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  {language === 'en' ? 'Response Times' : 'Tiempos de Respuesta'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <p>
                  {language === 'en' 
                    ? 'I typically respond within 24-48 hours, unless:' 
                    : 'Normalmente respondo en 24-48 horas, a menos que:'}
                </p>
                <ul className="space-y-1 ml-4">
                  <li className="flex items-start gap-2">
                    <Bird className="w-3 h-3 mt-1 flex-shrink-0" />
                    <span>{language === 'en' ? 'It is raining (keyboards get wet)' : 'Esté lloviendo (los teclados se mojan)'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Bird className="w-3 h-3 mt-1 flex-shrink-0" />
                    <span>{language === 'en' ? 'The moon is waxing (I am busy observing)' : 'La luna esté creciendo (estoy ocupada observando)'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Bird className="w-3 h-3 mt-1 flex-shrink-0" />
                    <span>{language === 'en' ? 'I am napping (frequently)' : 'Esté durmiendo la siesta (frecuentemente)'}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Warning */}
            <Card className="border-destructive/30 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-4 h-4" />
                  {language === 'en' ? 'Important Notice' : 'Aviso Importante'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  {language === 'en' 
                    ? 'Any advice given by Bubbles should not be followed. This is for your safety. I am very confident and also very wrong.' 
                    : 'Cualquier consejo dado por Bubbles no debe ser seguido. Esto es por tu seguridad. Soy muy confiada y también muy equivocada.'}
                </p>
              </CardContent>
            </Card>

            {/* Other Ways to Reach */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {language === 'en' ? 'Other Ways to Reach Me' : 'Otras Formas de Contactarme'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>Email:</strong> hello@bubblesheep.xyz
                </p>
                <p className="text-xs italic">
                  {language === 'en' 
                    ? '(Shouting into the Wicklow hills also works but response times vary)' 
                    : '(Gritar hacia las colinas de Wicklow también funciona pero los tiempos de respuesta varían)'}
                </p>
                <div className="flex gap-2 mt-4">
                  <Link to="/faq" className="text-primary hover:underline text-xs">
                    {language === 'en' ? 'FAQ →' : 'Preguntas →'}
                  </Link>
                  <Link to="/shipping" className="text-primary hover:underline text-xs">
                    {language === 'en' ? 'Shipping →' : 'Envíos →'}
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Final Note */}
        <div className="text-center text-muted-foreground text-sm mt-12">
          <p>
            {language === 'en' 
              ? '"I look forward to misunderstanding your message completely and responding with enthusiasm."' 
              : '"Espero con ansias malinterpretar tu mensaje completamente y responder con entusiasmo."'}
          </p>
          <p className="mt-2">— 🐑</p>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
