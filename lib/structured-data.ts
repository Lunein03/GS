export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "GS Produções",
  "alternateName": "GS Produção",
  "url": "https://gsproducao.com",
  "logo": "https://gsproducao.com/images/gs-logo.svg",
  "description": "Há seis anos no mercado, a GS Produções se destaca como uma empresa líder em acessibilidade, especializada em tradução e interpretação nas línguas portuguesa, inglesa, francesa, italiana, espanhola e Libras (Língua Brasileira de Sinais). Oferece audiodescrição, dublagem, legendagem, edição, locução e cursos de Libras.",
  "foundingDate": "2019",
  "slogan": "Líder em Acessibilidade - Especializada em Libras",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Rio de Janeiro",
    "addressRegion": "RJ",
    "addressCountry": "BR"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+55-21-96819-9637",
    "contactType": "customer service",
    "availableLanguage": ["Portuguese", "English", "French", "Italian", "Spanish", "Brazilian Sign Language (Libras)"]
  },
  "sameAs": [
    "https://www.instagram.com/gsproducoes",
    "https://www.linkedin.com/company/gsproducoes"
  ],
  "serviceArea": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": -22.9068,
      "longitude": -43.1729
    },
    "geoRadius": "50000"
  },
  "areaServed": ["Rio de Janeiro", "São Paulo", "Brasil"],
  "knowsAbout": [
    "Acessibilidade",
    "Libras (Língua Brasileira de Sinais)",
    "Tradução Multilíngue",
    "Interpretação Simultânea",
    "Audiodescrição", 
    "Dublagem",
    "Legendagem",
    "Edição",
    "Locução",
    "Cursos de Libras",
    "Tradução Português",
    "Tradução Inglês",
    "Tradução Francês",
    "Tradução Italiano",
    "Tradução Espanhol"
  ],
  "hasCredential": [
    {
      "@type": "EducationalOccupationalCredential",
      "name": "6 anos de experiência no mercado de acessibilidade"
    }
  ],
  "award": [
    "Presença constante no Rock in Rio",
    "Colaboração com Fiocruz",
    "Parceria com Petrobras", 
    "Trabalhos com Estácio",
    "Participação no The Town"
  ]
}

export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "GS Produções",
  "image": "https://gsproducao.com/images/gs-logo.svg",
  "description": "Há seis anos no mercado, a GS Produções se destaca como uma empresa líder em acessibilidade, especializada em tradução e interpretação nas línguas portuguesa, inglesa, francesa, italiana, espanhola e Libras (Língua Brasileira de Sinais). Oferece audiodescrição, dublagem, legendagem, edição, locução e cursos de Libras.",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Rio de Janeiro",
    "addressRegion": "RJ",
    "addressCountry": "BR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": -22.9068,
    "longitude": -43.1729
  },
  "url": "https://gsproducao.com",
  "telephone": "+55-21-96819-9637",
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday",
      "Tuesday", 
      "Wednesday",
      "Thursday",
      "Friday"
    ],
    "opens": "09:00",
    "closes": "18:00"
  },
  "priceRange": "$$",
  "paymentAccepted": ["Cash", "Credit Card", "Debit Card", "Bank Transfer"],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5.0",
    "reviewCount": "50"
  },
  "review": [
    {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5"
      },
      "author": {
        "@type": "Organization",
        "name": "Rock in Rio"
      },
      "reviewBody": "Presença constante e profissional em nossos eventos, garantindo total acessibilidade."
    }
  ]
}

export const professionalServiceSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "GS Produções - Líder em Acessibilidade",
  "description": "Há seis anos no mercado, a GS Produções se destaca como uma empresa líder em acessibilidade, especializada em tradução e interpretação nas línguas portuguesa, inglesa, francesa, italiana, espanhola e Libras (Língua Brasileira de Sinais). Oferece audiodescrição, dublagem, legendagem, edição, locução e cursos de Libras.",
  "provider": {
    "@type": "Organization",
    "name": "GS Produções"
  },
  "areaServed": "Brasil",
  "availableChannel": {
    "@type": "ServiceChannel",
    "serviceUrl": "https://gsproducao.com",
    "servicePhone": "+55-21-96819-9637"
  },
  "serviceType": [
    "Tradução em Libras",
    "Interpretação em Libras", 
    "Tradução Português",
    "Tradução Inglês",
    "Tradução Francês",
    "Tradução Italiano",
    "Tradução Espanhol",
    "Interpretação Simultânea",
    "Audiodescrição Profissional",
    "Dublagem",
    "Legendagem",
    "Edição de Vídeo",
    "Locução Profissional",
    "Cursos de Libras",
    "Consultoria em Acessibilidade",
    "Produção de Eventos Acessíveis"
  ],
  "audience": [
    {
      "@type": "Audience",
      "audienceType": "Empresas Corporativas"
    },
    {
      "@type": "Audience", 
      "audienceType": "Instituições Educacionais"
    },
    {
      "@type": "Audience",
      "audienceType": "Eventos e Festivais"
    },
    {
      "@type": "Audience",
      "audienceType": "Produtoras Audiovisuais"
    }
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Serviços de Acessibilidade",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Tradução e Interpretação Multilíngue"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service", 
          "name": "Audiodescrição e Dublagem"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Cursos de Libras"
        }
      }
    ]
  }
}
