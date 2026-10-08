export interface Tier {
  name: string;
  price: string;
  lead: string;
  items: string[];
  quote: string;
  deliverable: string;
  cta: string;
  featured?: boolean;
}

export interface CompareRow {
  option: string;
  bestFor: string;
  takeaway: string;
  price: string;
}

export interface Testimonial {
  initials: string;
  name: string;
  quote: string;
  time: string;
}

export const PROBLEMS: string[] = [
  'El anuncio atrae al público equivocado',
  'El WhatsApp no filtra consultas',
  'La oferta no está pensada para quien compra',
  'No hay seguimiento comercial',
  'No hay un foco claro de campaña',
  'Se invierte sin saber qué producto, zona o público empujar',
];

export const TIERS: Tier[] = [
  {
    name: 'Diagnóstico de Captación Digital',
    price: 'USD 97',
    lead: 'Entendé qué está frenando tus consultas antes de invertir más.',
    items: [
      'Revisión de tu presencia digital',
      'Análisis de tu oferta',
      'Revisión de WhatsApp, web o canal de venta',
      'Errores y oportunidades detectados',
      'Primer foco de campaña recomendado',
    ],
    quote: '"No sé qué estoy haciendo mal."',
    deliverable: 'informe breve con diagnóstico y recomendación.',
    cta: 'Aplicar al diagnóstico',
  },
  {
    name: 'Plan de Captación 30 días',
    price: 'USD 147',
    lead: 'Una hoja de ruta clara: qué vender, a quién apuntar y con qué mensaje.',
    items: [
      'Foco principal y oferta sugerida',
      'Público objetivo recomendado',
      'Canal ideal: WhatsApp, formulario o web',
      'Ángulos de comunicación e ideas de anuncios',
      'Presupuesto sugerido y acciones a 30 días',
    ],
    quote: '"Quiero hacer publicidad, pero no sé por dónde empezar."',
    deliverable: 'documento con el plan de los próximos 30 días.',
    cta: 'Aplicar al plan',
  },
  {
    name: 'Puesta en Marcha con Activación Inicial',
    price: 'USD 397',
    lead: 'Dejamos activa tu primera estructura de campaña en Meta Ads.',
    items: [
      'Foco principal y revisión del canal de conversión',
      'Estructura inicial y copies base',
      'Carga de 1 campaña, 2 conjuntos, 4 anuncios',
      'Activación inicial',
      'Video o mensaje final de entrega',
    ],
    quote: '"Todavía no estoy listo para 6 meses de gestión mensual."',
    deliverable: 'primera campaña configurada y activada.',
    cta: 'Aplicar a Puesta en Marcha',
    featured: true,
  },
];

export const COMPARE: CompareRow[] = [
  { option: 'Diagnóstico', bestFor: 'Entender qué está fallando', takeaway: 'Claridad y recomendación', price: 'USD 97' },
  { option: 'Plan de Captación', bestFor: 'Saber qué hacer durante 30 días', takeaway: 'Estrategia documentada', price: 'USD 147' },
  { option: 'Puesta en Marcha', bestFor: 'Empezar con campaña activa', takeaway: 'Primera estructura activada', price: 'USD 397' },
];

export const YES_LIST: string[] = [
  'Tenés un negocio o servicio activo en Uruguay',
  'Querés más clientes o consultas de calidad',
  'Ya vendés (o estás listo para vender)',
  'Podés invertir en publicidad',
  'Tenés WhatsApp, web u otro canal de venta',
  'Querés dejar de improvisar con anuncios',
];

export const NO_LIST: string[] = [
  'Buscás resultados mágicos en pocos días',
  'No tenés un negocio activo',
  'No podés invertir en pauta',
  'Querés aprender Meta Ads para hacerlo solo',
  'Querés solo "más seguidores"',
  'No tenés tiempo para responder consultas',
];

// Rating y reseñas reales de Google (vamosbienagencia.com).
export const GOOGLE_RATING = 4.9;
export const GOOGLE_REVIEW_COUNT = 136;

export const TESTIMONIALS_ROW_A: Testimonial[] = [
  {
    initials: 'SE',
    name: 'Sebastian Estevez',
    quote: 'Se nota que saben lo que hacen. No prometen magia, pero si trabajo serio y resultados concretos.',
    time: 'Hace 4 semanas',
  },
  {
    initials: 'MG',
    name: 'Mariela Groisman',
    quote: 'Geniosss thiago y jero! gracias por su ayuda y por potenciar siempre con la mejor!',
    time: 'Hace 2 semanas',
  },
  {
    initials: 'CG',
    name: 'Carolina Garozzo',
    quote: 'Los mejores!',
    time: 'Hace 4 semanas',
  },
  {
    initials: 'MA',
    name: 'Marcos Aldazabal',
    quote: 'Excelente servicio personalizado de Gael, impecable seguimiento y resultados.',
    time: 'Hace 2 meses',
  },
  {
    initials: 'LM',
    name: 'Lucas Maciel',
    quote: 'Soy cliente hace ya 3 años. Me han ayudado a crecer muchísimo. Gracias muchachos!',
    time: 'Hace 7 meses',
  },
  {
    initials: 'PL',
    name: 'Paco Lozano',
    quote: 'Atención 10 de 10. Super comprometidos y proactivos. Un espectáculo y vamos por mas!!',
    time: 'Hace 7 meses',
  },
  {
    initials: 'BE',
    name: 'Bless Estetica',
    quote: 'Nuestra clínica creció muchísimo en pacientes y logró consolidarse en Punta del Este.',
    time: 'Hace 4 semanas',
  },
  {
    initials: 'DV',
    name: 'Diego Valdez',
    quote: 'Excelente atención y comunicación. Recomendable 100%.',
    time: 'Hace 2 semanas',
  },
  {
    initials: 'PP',
    name: 'Patricia Parisi',
    quote: 'Una experiencia muy positiva en ventas y atención. Super agradecida y vamos por mas.',
    time: 'Hace 4 semanas',
  },
];

export const TESTIMONIALS_ROW_B: Testimonial[] = [
  {
    initials: 'JB',
    name: 'Jimena Baez',
    quote: 'Lo mejor de lo mejor! Saben en serio. Gracias por tanto.',
    time: 'Hace 3 meses',
  },
  {
    initials: 'ME',
    name: 'Marcelo Escudero',
    quote: 'Trabajo con ellos hace un año y medio. Los recomiendo fuertemente!',
    time: 'Hace 7 meses',
  },
  {
    initials: 'VW',
    name: 'Valeria Wejjman',
    quote: 'Me ayudaron a potenciar mi marca y aumentar mis ventas. Los super recomiendo!',
    time: 'Hace 9 meses',
  },
  {
    initials: 'MM',
    name: 'Maxi Minali',
    quote: 'Desde que conocí Vamos Bien empecé a vender más. Son atentos y muy humanos, lo mejor!',
    time: 'Hace 2 meses',
  },
  {
    initials: 'AA',
    name: 'Actividades Acuáticas',
    quote: 'Contratamos el servicio hace 3 meses y estamos muy conformes. Equipo muy profesional.',
    time: 'Hace 4 semanas',
  },
  {
    initials: 'GQ',
    name: 'Gonzalo Quiroz',
    quote: 'Excelente trabajo con mucha dedicación y atención en cada detalle. Los super recomiendo!!',
    time: 'Hace un mes',
  },
  {
    initials: 'ES',
    name: 'Euge Soria',
    quote: 'Logré tener ventas constantes. Incorporar a Vamos Bien fue una excelente decisión.',
    time: 'Hace 4 meses',
  },
  {
    initials: 'FU',
    name: 'Franco Ucedo',
    quote: '6 meses trabajando y los resultados son excelentes. La mejor decisión para mi negocio.',
    time: 'Hace 7 meses',
  },
  {
    initials: 'JBa',
    name: 'Joaquin Bagazette',
    quote: 'Tres semanas con Pablo de Vamos Bien y tripliqué mis ventas. No lo puedo creer!',
    time: 'Hace un año',
  },
];
