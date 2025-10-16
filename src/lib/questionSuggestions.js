// Sugestões de perguntas por nicho de empresa

export const niches = [
  { id: 'restaurante', name: 'Restaurante / Food Service' },
  { id: 'ecommerce', name: 'E-commerce / Loja Online' },
  { id: 'saude', name: 'Saúde / Clínica / Hospital' },
  { id: 'educacao', name: 'Educação / Escola / Curso' },
  { id: 'tecnologia', name: 'Tecnologia / Software / SaaS' },
  { id: 'beleza', name: 'Beleza / Estética / Salão' },
  { id: 'fitness', name: 'Academia / Fitness / Esportes' },
  { id: 'hotelaria', name: 'Hotel / Pousada / Hospedagem' },
  { id: 'automotivo', name: 'Automotivo / Oficina / Concessionária' },
  { id: 'varejo', name: 'Varejo / Loja Física' },
  { id: 'servicos', name: 'Serviços Profissionais / Consultoria' },
  { id: 'imobiliaria', name: 'Imobiliária / Corretagem' },
];

export const questionSuggestions = {
  restaurante: [
    {
      type: 'nps',
      text: 'Você recomendaria nosso restaurante para um amigo ou colega?',
      isMain: true,
    },
    {
      type: 'stars',
      text: 'Como você avalia a qualidade da comida?',
    },
    {
      type: 'stars',
      text: 'Como você avalia o atendimento da nossa equipe?',
    },
    {
      type: 'emotion_scale',
      text: 'O ambiente do restaurante é agradável?',
    },
    {
      type: 'like_dislike',
      text: 'O tempo de espera foi adequado?',
    },
  ],
  ecommerce: [
    {
      type: 'nps',
      text: 'Você recomendaria nossa loja online para um amigo ou colega?',
      isMain: true,
    },
    {
      type: 'stars',
      text: 'Como você avalia a qualidade dos produtos?',
    },
    {
      type: 'emotion_scale',
      text: 'O site é fácil de usar e navegar?',
    },
    {
      type: 'stars',
      text: 'Como você avalia o prazo de entrega?',
    },
    {
      type: 'like_dislike',
      text: 'Você considera a variedade de produtos adequada às suas necessidades?',
    },
  ],
  saude: [
    {
      type: 'nps',
      text: 'Você recomendaria nossa clínica para um amigo ou familiar?',
      isMain: true,
    },
    {
      type: 'stars',
      text: 'Como você avalia o atendimento da recepção?',
    },
    {
      type: 'stars',
      text: 'Como você avalia o atendimento do profissional de saúde?',
    },
    {
      type: 'emotion_scale',
      text: 'A limpeza e organização da clínica são satisfatórias?',
    },
    {
      type: 'like_dislike',
      text: 'O tempo de espera foi adequado?',
    },
  ],
  educacao: [
    {
      type: 'nps',
      text: 'Você recomendaria nossa instituição para um amigo ou colega?',
      isMain: true,
    },
    {
      type: 'stars',
      text: 'Como você avalia a qualidade do ensino?',
    },
    {
      type: 'stars',
      text: 'Como você avalia a infraestrutura da instituição?',
    },
    {
      type: 'emotion_scale',
      text: 'O atendimento da secretaria é satisfatório?',
    },
    {
      type: 'like_dislike',
      text: 'O material didático atende às suas expectativas?',
    },
  ],
  tecnologia: [
    {
      type: 'nps',
      text: 'Você recomendaria nosso produto/serviço para um colega?',
      isMain: true,
    },
    {
      type: 'stars',
      text: 'Como você avalia a facilidade de uso do produto?',
    },
    {
      type: 'stars',
      text: 'Como você avalia o suporte técnico?',
    },
    {
      type: 'emotion_scale',
      text: 'O produto atende às suas necessidades?',
    },
    {
      type: 'like_dislike',
      text: 'A documentação e tutoriais são claros e úteis?',
    },
  ],
  beleza: [
    {
      type: 'nps',
      text: 'Você recomendaria nosso salão para um amigo ou familiar?',
      isMain: true,
    },
    {
      type: 'stars',
      text: 'Como você avalia a qualidade do serviço prestado?',
    },
    {
      type: 'stars',
      text: 'Como você avalia o atendimento do profissional?',
    },
    {
      type: 'emotion_scale',
      text: 'O ambiente do salão é agradável e limpo?',
    },
    {
      type: 'like_dislike',
      text: 'O resultado ficou de acordo com suas expectativas?',
    },
  ],
  fitness: [
    {
      type: 'nps',
      text: 'Você recomendaria nossa academia para um amigo?',
      isMain: true,
    },
    {
      type: 'stars',
      text: 'Como você avalia a qualidade dos equipamentos?',
    },
    {
      type: 'stars',
      text: 'Como você avalia o atendimento dos instrutores?',
    },
    {
      type: 'emotion_scale',
      text: 'A limpeza e organização da academia são satisfatórias?',
    },
    {
      type: 'like_dislike',
      text: 'Os horários de funcionamento atendem às suas necessidades?',
    },
  ],
  hotelaria: [
    {
      type: 'nps',
      text: 'Você recomendaria nosso hotel para um amigo ou familiar?',
      isMain: true,
    },
    {
      type: 'stars',
      text: 'Como você avalia a qualidade das acomodações?',
    },
    {
      type: 'stars',
      text: 'Como você avalia o atendimento da equipe?',
    },
    {
      type: 'emotion_scale',
      text: 'A limpeza do hotel é satisfatória?',
    },
    {
      type: 'like_dislike',
      text: 'O café da manhã atendeu às suas expectativas?',
    },
  ],
  automotivo: [
    {
      type: 'nps',
      text: 'Você recomendaria nossos serviços para um amigo?',
      isMain: true,
    },
    {
      type: 'stars',
      text: 'Como você avalia a qualidade do serviço prestado?',
    },
    {
      type: 'stars',
      text: 'Como você avalia o atendimento da equipe?',
    },
    {
      type: 'emotion_scale',
      text: 'O prazo de entrega foi adequado?',
    },
    {
      type: 'like_dislike',
      text: 'O preço cobrado foi justo pelo serviço prestado?',
    },
  ],
  varejo: [
    {
      type: 'nps',
      text: 'Você recomendaria nossa loja para um amigo ou familiar?',
      isMain: true,
    },
    {
      type: 'stars',
      text: 'Como você avalia a qualidade dos produtos?',
    },
    {
      type: 'stars',
      text: 'Como você avalia o atendimento da equipe?',
    },
    {
      type: 'emotion_scale',
      text: 'A organização e limpeza da loja são satisfatórias?',
    },
    {
      type: 'like_dislike',
      text: 'Você considera a variedade de produtos adequada?',
    },
  ],
  servicos: [
    {
      type: 'nps',
      text: 'Você recomendaria nossos serviços para um colega?',
      isMain: true,
    },
    {
      type: 'stars',
      text: 'Como você avalia a qualidade do serviço prestado?',
    },
    {
      type: 'stars',
      text: 'Como você avalia o atendimento e comunicação?',
    },
    {
      type: 'emotion_scale',
      text: 'O prazo de entrega foi adequado?',
    },
    {
      type: 'like_dislike',
      text: 'O resultado atendeu às suas expectativas?',
    },
  ],
  imobiliaria: [
    {
      type: 'nps',
      text: 'Você recomendaria nossos serviços para um amigo ou familiar?',
      isMain: true,
    },
    {
      type: 'stars',
      text: 'Como você avalia o atendimento do corretor?',
    },
    {
      type: 'stars',
      text: 'Como você avalia a qualidade dos imóveis apresentados?',
    },
    {
      type: 'emotion_scale',
      text: 'O processo de negociação foi claro e transparente?',
    },
    {
      type: 'like_dislike',
      text: 'A documentação e burocracia foram bem explicadas?',
    },
  ],
};

