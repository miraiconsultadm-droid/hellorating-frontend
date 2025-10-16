// Função para calcular métricas do dashboard a partir das respostas
export function calculateDashboardMetrics(responses, campaigns = []) {
  if (responses.length === 0) {
    return {
      nps: 0,
      responseRate: 0,
      openRate: 0,
      errorRate: 0,
      npsPercentage: [
        { category: 'Promotores', value: '0', color: '#10b981' },
        { category: 'Passivos', value: '0', color: '#f59e0b' },
        { category: 'Detratores', value: '0', color: '#ef4444' },
      ],
      npsScores: Array.from({ length: 11 }, (_, i) => ({ score: i.toString(), count: 0 })),
      latestResponses: [],
    };
  }

  // Encontrar a pergunta NPS principal de cada resposta
  const npsScores = [];
  const categoryCounts = { promotores: 0, passivos: 0, detratores: 0 };
  const scoreCounts = Array(11).fill(0);

  responses.forEach((response) => {
    // Encontrar a campanha correspondente
    const campaign = campaigns.find(c => c.id === response.campaignId);
    if (!campaign) return;

    // Encontrar a pergunta NPS principal
    const npsQuestion = campaign.questions?.find(q => q.isMain);
    if (!npsQuestion) return;

    const score = response.answers[npsQuestion.id];
    if (score !== undefined && score !== null) {
      npsScores.push(score);
      scoreCounts[score]++;

      // Categorizar
      if (score >= 9) categoryCounts.promotores++;
      else if (score >= 7) categoryCounts.passivos++;
      else categoryCounts.detratores++;
    }
  });

  // Calcular NPS
  const totalResponses = npsScores.length;
  const promotersPercent = (categoryCounts.promotores / totalResponses) * 100;
  const detractorsPercent = (categoryCounts.detratores / totalResponses) * 100;
  const nps = Math.round(promotersPercent - detractorsPercent);

  // Calcular porcentagens
  const npsPercentage = [
    {
      category: 'Promotores',
      value: ((categoryCounts.promotores / totalResponses) * 100).toFixed(2),
      color: '#10b981',
    },
    {
      category: 'Passivos',
      value: ((categoryCounts.passivos / totalResponses) * 100).toFixed(2),
      color: '#f59e0b',
    },
    {
      category: 'Detratores',
      value: ((categoryCounts.detratores / totalResponses) * 100).toFixed(2),
      color: '#ef4444',
    },
  ];

  // Preparar dados de scores
  const npsScoresData = scoreCounts.map((count, score) => ({
    score: score.toString(),
    count,
  }));

  // Preparar últimas respostas
  const latestResponses = responses
    .slice(-5)
    .reverse()
    .map((response) => {
      const campaign = campaigns.find(c => c.id === response.campaignId);
      const npsQuestion = campaign?.questions?.find(q => q.isMain);
      const score = npsQuestion ? response.answers[npsQuestion.id] : null;

      let category = 'N/A';
      if (score !== null && score !== undefined) {
        if (score >= 9) category = 'Promotor';
        else if (score >= 7) category = 'Passivo';
        else category = 'Detrator';
      }

      return {
        id: response.submittedAt,
        name: response.customerName,
        phone: response.customerPhone,
        score,
        category,
        date: new Date(response.submittedAt).toLocaleDateString('pt-BR'),
      };
    });

  return {
    nps,
    responseRate: 100, // Placeholder (seria calculado com dados de envio)
    openRate: 100, // Placeholder
    errorRate: 0, // Placeholder
    npsPercentage,
    npsScores: npsScoresData,
    latestResponses,
  };
}

// Função para calcular métricas de uma campanha específica
export function calculateCampaignMetrics(campaignId, responses, campaign) {
  const campaignResponses = responses.filter(r => r.campaignId === campaignId);
  return calculateDashboardMetrics(campaignResponses, [campaign]);
}

