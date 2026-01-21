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
    "nav.scenarios": "Scenarios",
    "nav.explains": "Explains",
    "nav.shop": "Shop",
    "nav.story": "My Story",
    "nav.questions": "Questions",
    
    // Hero (Index)
    "hero.location": "Broadcasting from Sugarloaf Mountain, Wicklow",
    "hero.title.intro": "I'm",
    "hero.title.name": "Bubbles",
    "hero.title.tagline": "I know things.",
    "hero.subtitle": "A sheep. An expert. A trusted source of information that is absolutely, definitely, probably correct.",
    "hero.cta.merch": "Official Merch",
    "hero.cta.learn": "Learn From Me",
    
    // About Section (Index)
    "about.title": "The Most Informed Sheep in Ireland",
    "about.p1": "I live on Sugarloaf Mountain in County Wicklow. I spend my days eating grass and researching important topics. The internet has taught me many things. The mist whispers secrets. I have connected the dots that others refuse to see.",
    "about.p2": "My thoughts appear in bubbles above my head. This is normal. All sheep have this. You just can't see theirs because they don't know as much as me.",
    
    // Credentials (Index)
    "credentials.title": "My Qualifications",
    "credentials.staring.title": "Years of Staring",
    "credentials.staring.desc": "At the horizon. Thinking. Processing. Understanding things.",
    "credentials.facts.title": "Facts Discovered",
    "credentials.facts.desc": "I cannot count. But it's definitely a lot. Trust me.",
    "credentials.brain.title": "Sheep Brain",
    "credentials.brain.desc": "It's bigger than it looks. The wool hides the extra brain.",
    
    // Shop CTA (Index)
    "shop.title": "Wear My Thoughts",
    "shop.subtitle": "Premium apparel featuring my most important observations. Each purchase supports my research into whether clouds are real.",
    "shop.cta": "Visit the Shop",

    // New Hero (Index)
    "hero.meet": "Meet",
    "hero.bubbles": "Bubbles",
    "hero.tagline": "A sweet, daft sheep from Wicklow. Cute on the outside. Quietly savage inside the thought bubbles.",
    "hero.shopNow": "Shop Now",
    "hero.theLore": "The Lore",

    // CrossLinks
    "crossLinks.title": "Bubbles suggests you also visit...",
    "crossLinks.titleConfused": "Or get even more confused...",
    "crossLinks.facts.label": "Bubbles' Facts",
    "crossLinks.facts.desc": "100% researched, 0% accurate",
    "crossLinks.merch.label": "The Merch",
    "crossLinks.merch.desc": "Wear the confusion",
    "crossLinks.ask.label": "Ask Bubbles",
    "crossLinks.ask.desc": "Questions with unhelpful answers",

    // About Page
    "aboutPage.hero.title": "The Legend of Bubbles",
    "aboutPage.hero.subtitle": "A sweet, daft sheep from the Wicklow Mountains with a rich inner world of misinterpreted scenarios, existential grass-related thoughts, and devastatingly dry Irish wit.",
    "aboutPage.origin.title": "From Sugarloaf to Internet Fame",
    "aboutPage.origin.p1": "Bubbles started life as a Scottish Blackface sheep grazing the hillsides near Kilmacanogue, where the purple heather meets the golden gorse and the mist rolls down from Sugarloaf Mountain like it has somewhere important to be.",
    "aboutPage.origin.p2": "Unlike the rest of the flock, Bubbles grew up near the walking trails. Near the tour buses. Near the families with children who explained things very confidently to each other.",
    "aboutPage.origin.p3": "Some say Farmer Carmel was too kind. Let Bubbles wander too close to the visitors' centre. Others blame the Sugarloaf air—something in the mist that makes you remember everything and understand nothing.",
    "aboutPage.origin.p4": "The result: while other sheep saw grass, Bubbles saw information. Half-heard facts. Playground geopolitics. All of it absorbed. All of it believed. All of it connected in ways that almost make sense.",
    "aboutPage.origin.p5": "And then came the thought bubbles.",
    "aboutPage.origin.p6": "Nobody knows exactly when they appeared. Perhaps after overhearing a podcast about cryptocurrency through a hiker's earbuds.",
    "aboutPage.origin.p7": "What we do know: Bubbles thinks a lot. The arguments are flawless. The conclusions are absolute nonsense.",
    "aboutPage.origin.p8": "The internet noticed. Bubbles became an accidental expert on everything. A lovable prophet of confident wrongness you can't help but quote.",
    "aboutPage.research.title": "My Research",
    "aboutPage.research.subtitle": "All facts verified through rigorous fieldwork and careful listening.",
    "aboutPage.research.disclaimer": "* Some sources may have been joking. This was not considered relevant.",
    "aboutPage.explains.title": "Bubbles Explains...",
    "aboutPage.explains.subtitle": "Answers to questions nobody asked, delivered with complete certainty.",
    "aboutPage.ask.title": "Ask Bubbles Anything",
    "aboutPage.ask.subtitle": "Got a question? Bubbles has an answer. It will be wrong, but it will be confident.",
    "aboutPage.wicklow.title": "Rooted in Wicklow",
    "aboutPage.wicklow.p1": "The colours of Bubbles come directly from the land. The Bog Cotton Cream of the fleece. The Gorse Gold that lights up the hillsides each spring. The Heather Mauve that paints the mountains purple from July to November.",
    "aboutPage.wicklow.p2": "Even the savage wit is distinctly Irish—the \"slagging\" culture where affectionate teasing shows acceptance, the understatement where \"you're not the worst\" means \"you're probably the best.\"",
    "aboutPage.wicklow.p3": "Bubbles is a cute hoor in the best Irish sense: cunning, charming, operating just outside the rules while maintaining an air of complete innocence.",
    "aboutPage.cta.title": "Wear the Bubble",
    "aboutPage.cta.subtitle": "Express your inner sheep. Confidently wrong facts, beautifully printed. Premium quality, Wicklow soul.",
    "aboutPage.cta.button": "Shop the Collection",

    // Facts Page
    "factsPage.hero.title": "Facts I Have Learned",
    "factsPage.hero.subtitle": "Through extensive research (staring at things, thinking about things, reading one phone I found on a rock), I have accumulated vast knowledge. Here is some of it.",
    "factsPage.disclaimer": "Note: I have verified all of these facts myself. The verification process involved nodding thoughtfully.",
    "factsPage.today": "Today's Knowledge",
    "factsPage.more": "More Facts",
    "factsPage.categories.title": "My Research Areas",
    "factsPage.categories.nature": "Nature & Weather",
    "factsPage.categories.nature.desc": "My observations about the outside world",
    "factsPage.categories.tech": "Technology",
    "factsPage.categories.tech.desc": "How machines work (according to me)",
    "factsPage.categories.society": "Society & Humans",
    "factsPage.categories.society.desc": "Why people do what they do",
    "factsPage.categories.philosophy": "Deep Thoughts",
    "factsPage.categories.philosophy.desc": "The big questions, answered",
    "factsPage.methodology.title": "My Research Methodology",
    "factsPage.methodology.step1.title": "Observe Something",
    "factsPage.methodology.step1.desc": "I look at a thing. Could be a rock, a bird, the farmer's hat. Anything counts as data.",
    "factsPage.methodology.step2.title": "Have a Thought",
    "factsPage.methodology.step2.desc": "The thought appears in my bubble. I did not choose the thought. The thought chose me.",
    "factsPage.methodology.step3.title": "Decide It's True",
    "factsPage.methodology.step3.desc": "If the thought feels right, it is right. This is called \"intuition\" and it has never failed me (that I can remember).",
    "factsPage.methodology.step4.title": "Share It With You",
    "factsPage.methodology.step4.desc": "You're welcome.",
    "factsPage.cta.title": "Wear the Knowledge",
    "factsPage.cta.subtitle": "My thoughts, on your chest. So everyone knows you've done your research.",
    "factsPage.cta.button": "Shop the Collection",

    // FAQ Page
    "faqPage.title": "Frequently Asked Questions",
    "faqPage.subtitle": "Everything you need to know about Bubbles and our merch",
    "faqPage.contact.title": "Still have questions?",
    "faqPage.contact.subtitle": "Bubbles' thought bubbles can't answer everything. Contact our human team.",
    "faqPage.contact.button": "Contact Us",
    "faq.q1": "Who is Bubbles?",
    "faq.a1": "Bubbles is a sheep from the Wicklow Mountains who has spent too much time listening to tourists, children, and overheard conversations. The result: a rich inner world of confidently wrong facts, catastrophically misinterpreted information, and observations that almost make sense. Cute outside, chaos inside.",
    "faq.q2": "Why is Bubbles always wrong?",
    "faq.a2": "Bubbles isn't ignorant—Bubbles is miseducated. Every fact is correctly remembered but catastrophically misinterpreted. The argument structure is always flawless. The conclusion is always nonsense. That's the magic.",
    "faq.q3": "How long does shipping take?",
    "faq.a3": "Standard shipping takes 3-5 business days within Europe. International orders typically arrive within 7-14 business days. Express shipping options are available at checkout.",
    "faq.q4": "What's your return policy?",
    "faq.a4": "We offer a 30-day return policy. Items must be unworn, unwashed, and in their original packaging. Contact us to initiate a return and we'll send you a prepaid shipping label.",
    "faq.q5": "What sizes do you offer?",
    "faq.a5": "Our apparel comes in sizes XS through 3XL. Check the size guide on each product page for detailed measurements. If you're between sizes, we recommend sizing up for a more relaxed fit.",
    "faq.q6": "Are your products sustainable?",
    "faq.a6": "We use organic cotton for our t-shirts and hoodies, and all our packaging is recyclable. We're constantly working to make our supply chain more sustainable.",
    "faq.q7": "Can I wash my Bubbles merch?",
    "faq.a7": "Yes! Machine wash cold with like colors, tumble dry low, and avoid bleach. For best results and to preserve the print quality, turn the garment inside out before washing.",
    "faq.q8": "Do you ship internationally?",
    "faq.a8": "Yes, we ship worldwide! Shipping costs and delivery times vary by location. You'll see the exact shipping cost at checkout.",
    "faq.q9": "How do I track my order?",
    "faq.a9": "Once your order ships, you'll receive an email with a tracking number and link. You can also check your order status by logging into your account.",
    "faq.q10": "Can I suggest new Bubbles thoughts?",
    "faq.a10": "We love hearing from the flock! Send your thought bubble ideas to our contact page. If we use your suggestion, you might see it on future merch (and we'll send you something special).",
    "faq.q11": "Is the Earth flat?",
    "faq.a11": "No, the Earth is not flat. It's slightly crumpled. I've done extensive research by staring at puddles, and the water always settles unevenly. This proves the planet has wrinkles, like a blanket that's been slept on. Scientists call this 'topography' but I call it 'evidence of cosmic tossing and turning.' The real question isn't shape—it's why the Earth can't just make its bed properly.",
    "faq.q12": "Is the moon hollow?",
    "faq.a12": "Obviously. When you tap a solid rock, it makes a dull sound. When you look at the moon, it makes no sound at all. This proves it's not just hollow—it's completely empty inside, probably filled with the echoes of all the wishes people have made on stars that missed their target. I suspect this is where lost socks go. The astronauts didn't mention this because they signed confidentiality agreements with the sock industry.",
    "faq.q13": "Why is the sky blue?",
    "faq.a13": "The sky isn't actually blue. Your eyes are just tired from looking at grass all day and need a break. The sky is whatever colour your eyes aren't currently exhausted by. This is why sunsets are orange—by evening, everyone's been staring at blue things and their eyes switch to the backup colour. I tested this by closing my eyes for an hour and when I opened them, the sky was definitely more purple. Science.",
    "faq.q14": "Do fish know they're wet?",
    "faq.a14": "Fish have no concept of 'wet' because they've never experienced 'dry.' It's like asking if birds know they're in air. However, I've observed that fish always look slightly confused, which suggests they suspect something is off but can't quite put their fin on it. This permanent state of mild bewilderment is actually the origin of the phrase 'fish out of water'—they look equally confused everywhere.",
    "faq.q15": "Why do we dream?",
    "faq.a15": "Dreams are your brain's screensaver. When you're not using your thoughts, your brain doesn't want to waste them, so it plays random saved memories on shuffle. Sometimes it gets creative and mixes them together, which is why you might dream about your grandmother riding a bicycle through your school—your brain is just doing a playlist mashup. The stranger the dream, the more memory you have stored.",
    "faq.q16": "Can plants feel pain?",
    "faq.a16": "Plants feel everything, they're just incredibly patient about it. A tree that gets cut down doesn't scream because trees consider screaming undignified. I've spent considerable time observing grass after it's been mowed, and it always looks slightly shorter and more humble afterward. This isn't trauma—it's character building. Plants that are never pruned grow up entitled.",
    "faq.q17": "Why do we have fingernails?",
    "faq.a17": "Fingernails are leftover armour from when humans were smaller and needed protection from very tiny predators. As humans got bigger, the predators became less threatening, but the nails stayed because evolution forgot to remove them. They now serve primarily as emergency scratching tools and a surface for expressing personality through colour. Toenails exist purely out of evolutionary politeness—they didn't want fingernails to feel alone.",
  },
  es: {
    // Nav
    "nav.home": "Inicio",
    "nav.facts": "Datos",
    "nav.scenarios": "Escenarios",
    "nav.explains": "Explica",
    "nav.shop": "Tienda",
    "nav.story": "Mi Historia",
    "nav.questions": "Preguntas",
    
    // Hero (Index)
    "hero.location": "Transmitiendo desde la Montaña Sugarloaf, Wicklow",
    "hero.title.intro": "Soy",
    "hero.title.name": "Bubbles",
    "hero.title.tagline": "Sé cosas.",
    "hero.subtitle": "Una oveja. Una experta. Una fuente confiable de información que es absolutamente, definitivamente, probablemente correcta.",
    "hero.cta.merch": "Mercancía Oficial",
    "hero.cta.learn": "Aprende de Mí",
    
    // About Section (Index)
    "about.title": "La Oveja Más Informada de Irlanda",
    "about.p1": "Vivo en la Montaña Sugarloaf en el Condado de Wicklow. Paso mis días comiendo hierba e investigando temas importantes. Internet me ha enseñado muchas cosas. La niebla susurra secretos. He conectado los puntos que otros se niegan a ver.",
    "about.p2": "Mis pensamientos aparecen en burbujas sobre mi cabeza. Esto es normal. Todas las ovejas tienen esto. Simplemente no puedes ver las suyas porque no saben tanto como yo.",
    
    // Credentials (Index)
    "credentials.title": "Mis Calificaciones",
    "credentials.staring.title": "Años Mirando",
    "credentials.staring.desc": "Al horizonte. Pensando. Procesando. Entendiendo cosas.",
    "credentials.facts.title": "Datos Descubiertos",
    "credentials.facts.desc": "No sé contar. Pero definitivamente son muchos. Confía en mí.",
    "credentials.brain.title": "Cerebro de Oveja",
    "credentials.brain.desc": "Es más grande de lo que parece. La lana esconde el cerebro extra.",
    
    // Shop CTA (Index)
    "shop.title": "Usa Mis Pensamientos",
    "shop.subtitle": "Ropa premium con mis observaciones más importantes. Cada compra apoya mi investigación sobre si las nubes son reales.",
    "shop.cta": "Visitar la Tienda",

    // New Hero (Index)
    "hero.meet": "Conoce a",
    "hero.bubbles": "Bubbles",
    "hero.tagline": "Una oveja dulce y tonta de Wicklow. Linda por fuera. Silenciosamente salvaje dentro de las burbujas de pensamiento.",
    "hero.shopNow": "Comprar Ahora",
    "hero.theLore": "La Historia",

    // CrossLinks
    "crossLinks.title": "Bubbles sugiere que también visites...",
    "crossLinks.titleConfused": "O confúndete aún más...",
    "crossLinks.facts.label": "Datos de Bubbles",
    "crossLinks.facts.desc": "100% investigado, 0% preciso",
    "crossLinks.merch.label": "La Mercancía",
    "crossLinks.merch.desc": "Usa la confusión",
    "crossLinks.ask.label": "Pregunta a Bubbles",
    "crossLinks.ask.desc": "Preguntas con respuestas inútiles",

    // About Page
    "aboutPage.hero.title": "La Leyenda de Bubbles",
    "aboutPage.hero.subtitle": "Una oveja dulce y tonta de las Montañas de Wicklow con un rico mundo interior de escenarios malinterpretados, pensamientos existenciales relacionados con el pasto y un humor irlandés devastadoramente seco.",
    "aboutPage.origin.title": "De Sugarloaf a la Fama de Internet",
    "aboutPage.origin.p1": "Bubbles comenzó su vida como una oveja Scottish Blackface pastando en las laderas cerca de Kilmacanogue, donde el brezo púrpura se encuentra con la árgoma dorada y la niebla baja de la Montaña Sugarloaf como si tuviera un lugar importante adonde ir.",
    "aboutPage.origin.p2": "A diferencia del resto del rebaño, Bubbles creció cerca de los senderos. Cerca de los autobuses turísticos. Cerca de las familias con niños que explicaban cosas muy confiadamente entre ellos.",
    "aboutPage.origin.p3": "Algunos dicen que la Granjera Carmel fue demasiado amable. Dejó a Bubbles deambular demasiado cerca del centro de visitantes. Otros culpan al aire de Sugarloaf—algo en la niebla que te hace recordar todo y no entender nada.",
    "aboutPage.origin.p4": "El resultado: mientras otras ovejas veían pasto, Bubbles veía información. Datos a medio escuchar. Geopolítica de patio de recreo. Todo absorbido. Todo creído. Todo conectado de maneras que casi tienen sentido.",
    "aboutPage.origin.p5": "Y luego llegaron las burbujas de pensamiento.",
    "aboutPage.origin.p6": "Nadie sabe exactamente cuándo aparecieron. Quizás después de escuchar un podcast sobre criptomonedas a través de los auriculares de un excursionista.",
    "aboutPage.origin.p7": "Lo que sí sabemos: Bubbles piensa mucho. Los argumentos son impecables. Las conclusiones son un completo disparate.",
    "aboutPage.origin.p8": "Internet lo notó. Bubbles se convirtió en una experta accidental en todo. Una profeta adorable de la seguridad incorrecta que no puedes evitar citar.",
    "aboutPage.research.title": "Mi Investigación",
    "aboutPage.research.subtitle": "Todos los datos verificados mediante riguroso trabajo de campo y escucha cuidadosa.",
    "aboutPage.research.disclaimer": "* Algunas fuentes pueden haber estado bromeando. Esto no se consideró relevante.",
    "aboutPage.explains.title": "Bubbles Explica...",
    "aboutPage.explains.subtitle": "Respuestas a preguntas que nadie hizo, entregadas con completa certeza.",
    "aboutPage.ask.title": "Pregúntale Cualquier Cosa a Bubbles",
    "aboutPage.ask.subtitle": "¿Tienes una pregunta? Bubbles tiene una respuesta. Estará equivocada, pero será segura.",
    "aboutPage.wicklow.title": "Arraigada en Wicklow",
    "aboutPage.wicklow.p1": "Los colores de Bubbles vienen directamente de la tierra. El Crema de Algodón de Turbera del vellón. El Oro de Árgoma que ilumina las laderas cada primavera. El Malva de Brezo que pinta las montañas de púrpura de julio a noviembre.",
    "aboutPage.wicklow.p2": "Incluso el humor salvaje es distintivamente irlandés—la cultura del \"slagging\" donde las bromas cariñosas muestran aceptación, el eufemismo donde \"no eres el peor\" significa \"probablemente eres el mejor\".",
    "aboutPage.wicklow.p3": "Bubbles es una pícara en el mejor sentido irlandés: astuta, encantadora, operando justo fuera de las reglas mientras mantiene un aire de completa inocencia.",
    "aboutPage.cta.title": "Usa la Burbuja",
    "aboutPage.cta.subtitle": "Expresa tu oveja interior. Datos confidentemente erróneos, bellamente impresos. Calidad premium, alma de Wicklow.",
    "aboutPage.cta.button": "Comprar la Colección",

    // Facts Page
    "factsPage.hero.title": "Datos Que He Aprendido",
    "factsPage.hero.subtitle": "A través de una investigación extensa (mirar cosas, pensar en cosas, leer un teléfono que encontré en una roca), he acumulado un vasto conocimiento. Aquí hay algo de ello.",
    "factsPage.disclaimer": "Nota: He verificado todos estos datos yo misma. El proceso de verificación consistió en asentir pensativamente.",
    "factsPage.today": "Conocimiento de Hoy",
    "factsPage.more": "Más Datos",
    "factsPage.categories.title": "Mis Áreas de Investigación",
    "factsPage.categories.nature": "Naturaleza y Clima",
    "factsPage.categories.nature.desc": "Mis observaciones sobre el mundo exterior",
    "factsPage.categories.tech": "Tecnología",
    "factsPage.categories.tech.desc": "Cómo funcionan las máquinas (según yo)",
    "factsPage.categories.society": "Sociedad y Humanos",
    "factsPage.categories.society.desc": "Por qué la gente hace lo que hace",
    "factsPage.categories.philosophy": "Pensamientos Profundos",
    "factsPage.categories.philosophy.desc": "Las grandes preguntas, respondidas",
    "factsPage.methodology.title": "Mi Metodología de Investigación",
    "factsPage.methodology.step1.title": "Observar Algo",
    "factsPage.methodology.step1.desc": "Miro una cosa. Podría ser una roca, un pájaro, el sombrero del granjero. Cualquier cosa cuenta como datos.",
    "factsPage.methodology.step2.title": "Tener un Pensamiento",
    "factsPage.methodology.step2.desc": "El pensamiento aparece en mi burbuja. Yo no elegí el pensamiento. El pensamiento me eligió a mí.",
    "factsPage.methodology.step3.title": "Decidir Que Es Verdad",
    "factsPage.methodology.step3.desc": "Si el pensamiento se siente correcto, es correcto. Esto se llama \"intuición\" y nunca me ha fallado (que yo recuerde).",
    "factsPage.methodology.step4.title": "Compartirlo Contigo",
    "factsPage.methodology.step4.desc": "De nada.",
    "factsPage.cta.title": "Usa el Conocimiento",
    "factsPage.cta.subtitle": "Mis pensamientos, en tu pecho. Para que todos sepan que has hecho tu investigación.",
    "factsPage.cta.button": "Comprar la Colección",

    // FAQ Page
    "faqPage.title": "Preguntas Frecuentes",
    "faqPage.subtitle": "Todo lo que necesitas saber sobre Bubbles y nuestra mercancía",
    "faqPage.contact.title": "¿Aún tienes preguntas?",
    "faqPage.contact.subtitle": "Las burbujas de pensamiento de Bubbles no pueden responder todo. Contacta a nuestro equipo humano.",
    "faqPage.contact.button": "Contáctanos",
    "faq.q1": "¿Quién es Bubbles?",
    "faq.a1": "Bubbles es una oveja de las Montañas de Wicklow que ha pasado demasiado tiempo escuchando a turistas, niños y conversaciones ajenas. El resultado: un rico mundo interior de datos confidentemente incorrectos, información catastróficamente malinterpretada y observaciones que casi tienen sentido. Linda por fuera, caos por dentro.",
    "faq.q2": "¿Por qué Bubbles siempre está equivocada?",
    "faq.a2": "Bubbles no es ignorante—Bubbles está maleducada. Cada dato se recuerda correctamente pero se malinterpreta catastróficamente. La estructura del argumento siempre es impecable. La conclusión siempre es un disparate. Esa es la magia.",
    "faq.q3": "¿Cuánto tarda el envío?",
    "faq.a3": "El envío estándar tarda 3-5 días hábiles dentro de Europa. Los pedidos internacionales suelen llegar en 7-14 días hábiles. Las opciones de envío express están disponibles al finalizar la compra.",
    "faq.q4": "¿Cuál es su política de devoluciones?",
    "faq.a4": "Ofrecemos una política de devolución de 30 días. Los artículos deben estar sin usar, sin lavar y en su empaque original. Contáctanos para iniciar una devolución y te enviaremos una etiqueta de envío prepagada.",
    "faq.q5": "¿Qué tallas ofrecen?",
    "faq.a5": "Nuestra ropa viene en tallas XS hasta 3XL. Consulta la guía de tallas en cada página de producto para medidas detalladas. Si estás entre tallas, recomendamos elegir la talla más grande para un ajuste más relajado.",
    "faq.q6": "¿Sus productos son sostenibles?",
    "faq.a6": "Usamos algodón orgánico para nuestras camisetas y sudaderas, y todo nuestro empaque es reciclable. Trabajamos constantemente para hacer nuestra cadena de suministro más sostenible.",
    "faq.q7": "¿Puedo lavar mi mercancía de Bubbles?",
    "faq.a7": "¡Sí! Lavar a máquina con agua fría con colores similares, secar a baja temperatura y evitar la lejía. Para mejores resultados y preservar la calidad de la impresión, voltea la prenda al revés antes de lavar.",
    "faq.q8": "¿Hacen envíos internacionales?",
    "faq.a8": "¡Sí, enviamos a todo el mundo! Los costos de envío y tiempos de entrega varían según la ubicación. Verás el costo exacto de envío al finalizar la compra.",
    "faq.q9": "¿Cómo rastreo mi pedido?",
    "faq.a9": "Una vez que tu pedido se envíe, recibirás un correo electrónico con un número de seguimiento y enlace. También puedes verificar el estado de tu pedido iniciando sesión en tu cuenta.",
    "faq.q10": "¿Puedo sugerir nuevos pensamientos de Bubbles?",
    "faq.a10": "¡Nos encanta escuchar del rebaño! Envía tus ideas de burbujas de pensamiento a nuestra página de contacto. Si usamos tu sugerencia, podrías verla en mercancía futura (y te enviaremos algo especial).",
    "faq.q11": "¿La Tierra es plana?",
    "faq.a11": "No, la Tierra no es plana. Está ligeramente arrugada. He realizado una investigación extensa mirando charcos, y el agua siempre se asienta de manera desigual. Esto prueba que el planeta tiene arrugas, como una manta en la que se ha dormido. Los científicos llaman a esto 'topografía' pero yo lo llamo 'evidencia de vueltas cósmicas'. La verdadera pregunta no es la forma—es por qué la Tierra no puede simplemente hacer su cama correctamente.",
    "faq.q12": "¿La luna está hueca?",
    "faq.a12": "Obviamente. Cuando golpeas una roca sólida, hace un sonido sordo. Cuando miras la luna, no hace ningún sonido en absoluto. Esto prueba que no solo está hueca—está completamente vacía por dentro, probablemente llena de los ecos de todos los deseos que la gente ha hecho a estrellas que fallaron su objetivo. Sospecho que aquí es donde van los calcetines perdidos. Los astronautas no mencionaron esto porque firmaron acuerdos de confidencialidad con la industria de calcetines.",
    "faq.q13": "¿Por qué el cielo es azul?",
    "faq.a13": "El cielo no es realmente azul. Tus ojos simplemente están cansados de mirar hierba todo el día y necesitan un descanso. El cielo es del color que tus ojos no están agotados actualmente. Por eso los atardeceres son naranjas—al anochecer, todos han estado mirando cosas azules y sus ojos cambian al color de respaldo. Probé esto cerrando los ojos por una hora y cuando los abrí, el cielo definitivamente era más púrpura. Ciencia.",
    "faq.q14": "¿Los peces saben que están mojados?",
    "faq.a14": "Los peces no tienen concepto de 'mojado' porque nunca han experimentado 'seco.' Es como preguntar si los pájaros saben que están en el aire. Sin embargo, he observado que los peces siempre parecen ligeramente confundidos, lo que sugiere que sospechan que algo está mal pero no pueden precisar qué. Este estado permanente de leve desconcierto es en realidad el origen de la frase 'pez fuera del agua'—se ven igual de confundidos en todas partes.",
    "faq.q15": "¿Por qué soñamos?",
    "faq.a15": "Los sueños son el protector de pantalla de tu cerebro. Cuando no estás usando tus pensamientos, tu cerebro no quiere desperdiciarlos, así que reproduce recuerdos guardados al azar en modo aleatorio. A veces se pone creativo y los mezcla, por eso podrías soñar con tu abuela andando en bicicleta por tu escuela—tu cerebro solo está haciendo un mashup de playlist. Cuanto más extraño el sueño, más memoria tienes almacenada.",
    "faq.q16": "¿Las plantas sienten dolor?",
    "faq.a16": "Las plantas sienten todo, solo son increíblemente pacientes al respecto. Un árbol que se corta no grita porque los árboles consideran que gritar es indigno. He pasado considerable tiempo observando el césped después de ser cortado, y siempre se ve ligeramente más corto y más humilde después. Esto no es trauma—es construcción de carácter. Las plantas que nunca se podan crecen engreídas.",
    "faq.q17": "¿Por qué tenemos uñas?",
    "faq.a17": "Las uñas son armadura sobrante de cuando los humanos eran más pequeños y necesitaban protección de depredadores muy diminutos. A medida que los humanos crecieron, los depredadores se volvieron menos amenazantes, pero las uñas se quedaron porque la evolución olvidó quitarlas. Ahora sirven principalmente como herramientas de rascado de emergencia y una superficie para expresar personalidad a través del color. Las uñas de los pies existen puramente por cortesía evolutiva—no querían que las uñas de las manos se sintieran solas.",
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
