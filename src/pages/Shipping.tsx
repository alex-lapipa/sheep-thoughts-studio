import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck, Clock, MapPin, RotateCcw, AlertTriangle, Globe, Thermometer, Bird, Ship } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Shipping = () => {
  const { language } = useLanguage();
  const siteUrl = "https://sheep-thoughts-studio.lovable.app";
  const supabaseUrl = "https://iteckeoeowgguhgrpcnm.supabase.co";
  const ogImageUrl = `${supabaseUrl}/functions/v1/og-shipping-image?lang=${language}`;

  return (
    <Layout>
      <Helmet>
        <title>{language === 'en' ? 'Shipping & Returns | Bubbles the Sheep' : 'Envíos y Devoluciones | Bubbles la Oveja'}</title>
        <meta name="description" content={language === 'en' 
          ? "Shipping policy explained by a sheep who believes packages travel through trained moles. 30-day returns, express sheep courier available." 
          : "Política de envío explicada por una oveja que cree que los paquetes viajan por topos entrenados. Devoluciones de 30 días."} />
        <meta property="og:title" content={language === 'en' ? 'Shipping & Returns | Bubbles the Sheep' : 'Envíos y Devoluciones | Bubbles'} />
        <meta property="og:description" content={language === 'en' 
          ? "Packages travel through trained moles and roads that move at night. I am an expert in logistics now." 
          : "Los paquetes viajan por topos entrenados y carreteras que se mueven de noche. Ahora soy experta en logística."} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/shipping`} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={language === 'en' ? 'Shipping & Returns' : 'Envíos y Devoluciones'} />
        <meta name="twitter:description" content={language === 'en' ? 'Logistics as understood by a sheep' : 'Logística según una oveja'} />
        <meta name="twitter:image" content={ogImageUrl} />
        <link rel="canonical" href={`${siteUrl}/shipping`} />
      </Helmet>
      <div className="container max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Package className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-display font-bold text-foreground mb-4">
            {language === 'en' ? 'Shipping & Returns' : 'Envíos y Devoluciones'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en' 
              ? 'Last updated: January 22, 2026' 
              : 'Última actualización: 22 de enero de 2026'}
          </p>
        </div>

        {/* Bubbles' Note */}
        <Card className="mb-8 border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-foreground italic">
              {language === 'en' 
                ? '"I have personally studied the postal system by watching humans put letters in red boxes. The letters go underground where trained moles sort them by smell. I am an expert in logistics now."' 
                : '"He estudiado personalmente el sistema postal observando a los humanos poner cartas en buzones rojos. Las cartas van bajo tierra donde topos entrenados las clasifican por olor. Ahora soy experto en logística."'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              — Bubbles, {language === 'en' ? 'Self-Appointed Head of Postal Affairs' : 'Jefe Autoproclamado de Asuntos Postales'}
            </p>
          </CardContent>
        </Card>

        {/* Shipping Process */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              {language === 'en' ? 'How Shipping Works' : 'Cómo Funciona el Envío'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground">
            <p>
              {language === 'en' 
                ? 'When you order merchandise, the following scientifically verified process occurs:' 
                : 'Cuando pides mercancía, ocurre el siguiente proceso científicamente verificado:'}
            </p>
            <ol className="list-decimal list-inside space-y-3 ml-4">
              <li>
                {language === 'en' 
                  ? 'Your order is received by what humans call "the cloud." This is an actual cloud. It hovers over a warehouse in Ireland.'
                  : 'Tu pedido es recibido por lo que los humanos llaman "la nube." Esta es una nube real. Flota sobre un almacén en Irlanda.'}
              </li>
              <li>
                {language === 'en' 
                  ? 'A team of trained border collies packages your items. They are very fast because they have four paws.'
                  : 'Un equipo de border collies entrenados empaca tus artículos. Son muy rápidos porque tienen cuatro patas.'}
              </li>
              <li>
                {language === 'en' 
                  ? 'The package is given to a delivery driver who, according to my research, never uses the same route twice because roads move at night.'
                  : 'El paquete se entrega a un repartidor que, según mi investigación, nunca usa la misma ruta dos veces porque las carreteras se mueven por la noche.'}
              </li>
              <li>
                {language === 'en' 
                  ? 'Your package arrives. The tracking number is actually a poem written in numbers.'
                  : 'Tu paquete llega. El número de seguimiento es en realidad un poema escrito en números.'}
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Delivery Times */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              {language === 'en' ? 'Delivery Times' : 'Tiempos de Entrega'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground">
            <p>
              {language === 'en' 
                ? 'I have calculated delivery times using advanced sheep mathematics:' 
                : 'He calculado los tiempos de entrega usando matemáticas avanzadas de oveja:'}
            </p>
            <div className="grid gap-4">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">{language === 'en' ? 'Ireland' : 'Irlanda'}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' 
                      ? '2-4 business days (faster if the wind is helpful)' 
                      : '2-4 días hábiles (más rápido si el viento ayuda)'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Globe className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">{language === 'en' ? 'Rest of Europe' : 'Resto de Europa'}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' 
                      ? '5-10 business days (packages must clear the Alps, which are very tall)' 
                      : '5-10 días hábiles (los paquetes deben cruzar los Alpes, que son muy altos)'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Ship className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">{language === 'en' ? 'International' : 'Internacional'}</p>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' 
                      ? '10-21 business days (oceans are large and packages cannot swim)' 
                      : '10-21 días hábiles (los océanos son grandes y los paquetes no saben nadar)'}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground italic">
              {language === 'en' 
                ? 'Note: A "business day" is any day when humans wear shoes. Weekends count if the postman feels motivated.' 
                : 'Nota: Un "día hábil" es cualquier día cuando los humanos usan zapatos. Los fines de semana cuentan si el cartero se siente motivado.'}
            </p>
          </CardContent>
        </Card>

        {/* Shipping Factors */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-primary" />
              {language === 'en' ? 'Factors Affecting Delivery' : 'Factores que Afectan la Entrega'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground">
            <p>
              {language === 'en' 
                ? 'Through extensive observation, I have identified things that slow down packages:' 
                : 'A través de observación extensiva, he identificado cosas que ralentizan los paquetes:'}
            </p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2">
                <Bird className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                <span>
                  {language === 'en' 
                    ? 'Migrating birds — they sometimes carry packages the wrong direction' 
                    : 'Aves migratorias — a veces llevan los paquetes en la dirección equivocada'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Thermometer className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                <span>
                  {language === 'en' 
                    ? 'Temperature — packages move slower when cold because they get sleepy' 
                    : 'Temperatura — los paquetes se mueven más lento cuando hace frío porque les da sueño'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Globe className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                <span>
                  {language === 'en' 
                    ? 'Time zones — your package experiences confusion when crossing invisible lines' 
                    : 'Zonas horarias — tu paquete experimenta confusión al cruzar líneas invisibles'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                <span>
                  {language === 'en' 
                    ? 'Customs — a building where packages must answer questions about their feelings' 
                    : 'Aduanas — un edificio donde los paquetes deben responder preguntas sobre sus sentimientos'}
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Returns Policy */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-primary" />
              {language === 'en' ? 'Returns Policy' : 'Política de Devoluciones'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground">
            <p>
              {language === 'en' 
                ? 'If you are not satisfied with your merchandise, you may return it. Here is how returns work according to my understanding:' 
                : 'Si no estás satisfecho con tu mercancía, puedes devolverla. Así es como funcionan las devoluciones según mi entendimiento:'}
            </p>
            <div className="space-y-4">
              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-medium mb-2">{language === 'en' ? '30-Day Return Window' : 'Ventana de Devolución de 30 Días'}</h4>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' 
                    ? 'You have 30 days to return items. This is because 30 is the number of teeth humans are supposed to have, and teeth are used to make decisions.' 
                    : 'Tienes 30 días para devolver artículos. Esto es porque 30 es el número de dientes que se supone tienen los humanos, y los dientes se usan para tomar decisiones.'}
                </p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-medium mb-2">{language === 'en' ? 'Condition Requirements' : 'Requisitos de Condición'}</h4>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' 
                    ? 'Items must be unworn and unwashed. We can tell if you washed it because the fabric remembers water and tells us.' 
                    : 'Los artículos deben estar sin usar y sin lavar. Podemos saber si lo lavaste porque la tela recuerda el agua y nos lo dice.'}
                </p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-medium mb-2">{language === 'en' ? 'Refund Processing' : 'Procesamiento de Reembolso'}</h4>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' 
                    ? 'Refunds are processed in 5-7 business days. The money travels back to your bank through tiny tubes in the internet.' 
                    : 'Los reembolsos se procesan en 5-7 días hábiles. El dinero viaja de regreso a tu banco a través de pequeños tubos en el internet.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Non-Returnable Items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-primary" />
              {language === 'en' ? 'Items That Cannot Be Returned' : 'Artículos Que No Pueden Devolverse'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground">
            <ul className="space-y-2 ml-4">
              <li>
                {language === 'en' 
                  ? '• Items that have been worn outdoors (grass stains contain memories)' 
                  : '• Artículos que se han usado al aire libre (las manchas de hierba contienen recuerdos)'}
              </li>
              <li>
                {language === 'en' 
                  ? '• Items that have bonded emotionally with you (we can sense this)' 
                  : '• Artículos que se han vinculado emocionalmente contigo (podemos sentir esto)'}
              </li>
              <li>
                {language === 'en' 
                  ? '• Items purchased during a full moon (the receipt becomes legally binding in a different way)' 
                  : '• Artículos comprados durante luna llena (el recibo se vuelve legalmente vinculante de manera diferente)'}
              </li>
              <li>
                {language === 'en' 
                  ? '• Limited edition drops after 48 hours (the items become vintage instantly)' 
                  : '• Lanzamientos de edición limitada después de 48 horas (los artículos se vuelven vintage instantáneamente)'}
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Damaged Items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              {language === 'en' ? 'Damaged or Incorrect Items' : 'Artículos Dañados o Incorrectos'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground">
            <p>
              {language === 'en' 
                ? 'If your item arrives damaged or we sent you the wrong thing:' 
                : 'Si tu artículo llega dañado o te enviamos algo incorrecto:'}
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>
                {language === 'en' 
                  ? 'Take a photo of the issue (cameras capture the truth, unlike mirrors which show lies)' 
                  : 'Toma una foto del problema (las cámaras capturan la verdad, a diferencia de los espejos que muestran mentiras)'}
              </li>
              <li>
                {language === 'en' 
                  ? 'Email us at hello@bubblesheep.xyz with the photo and your order number' 
                  : 'Envíanos un email a hello@bubblesheep.xyz con la foto y tu número de pedido'}
              </li>
              <li>
                {language === 'en' 
                  ? 'We will send a replacement immediately via express sheep courier' 
                  : 'Enviaremos un reemplazo inmediatamente vía mensajero oveja express'}
              </li>
            </ol>
            <p className="text-sm text-muted-foreground italic mt-4">
              {language === 'en' 
                ? 'We take full responsibility for any errors. Unless it was caused by Mercury being in retrograde, in which case nobody is responsible for anything.' 
                : 'Asumimos total responsabilidad por cualquier error. A menos que haya sido causado por Mercurio retrógrado, en cuyo caso nadie es responsable de nada.'}
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              {language === 'en' ? 'Questions About Your Order' : 'Preguntas Sobre Tu Pedido'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground">
            <p>
              {language === 'en' 
                ? 'If you have questions about shipping or returns:' 
                : 'Si tienes preguntas sobre envíos o devoluciones:'}
            </p>
            <ul className="space-y-2 ml-4">
              <li>
                {language === 'en' ? '• Email: hello@bubblesheep.xyz' : '• Email: hello@bubblesheep.xyz'}
              </li>
              <li>
                {language === 'en' 
                  ? '• Response time: 24-48 hours (faster if you include a polite greeting)' 
                  : '• Tiempo de respuesta: 24-48 horas (más rápido si incluyes un saludo cortés)'}
              </li>
            </ul>
            <p className="text-sm text-muted-foreground">
              {language === 'en' 
                ? 'Please include your order number. Order numbers are sacred and must be treated with respect.' 
                : 'Por favor incluye tu número de pedido. Los números de pedido son sagrados y deben ser tratados con respeto.'}
            </p>
            <div className="flex gap-4 mt-4">
              <Link to="/faq" className="text-primary hover:underline text-sm">
                {language === 'en' ? 'Visit FAQ →' : 'Visitar Preguntas →'}
              </Link>
              <Link to="/privacy" className="text-primary hover:underline text-sm">
                {language === 'en' ? 'Privacy Policy →' : 'Política de Privacidad →'}
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Final Note */}
        <div className="text-center text-muted-foreground text-sm">
          <p>
            {language === 'en' 
              ? '"I have never received a package myself because the postal service does not recognize sheep addresses. This makes me an unbiased expert."' 
              : '"Nunca he recibido un paquete porque el servicio postal no reconoce direcciones de ovejas. Esto me hace un experto imparcial."'}
          </p>
          <p className="mt-2">— 🐑</p>
        </div>
      </div>
    </Layout>
  );
};

export default Shipping;