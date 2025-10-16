import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, GripVertical, Copy, ExternalLink, Star, ThumbsUp, ThumbsDown, TrendingUp, Eye, AlertCircle, Mail } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { questionSuggestions, niches } from '@/lib/questionSuggestions';
import { api } from '@/lib/api';
import { calculateCampaignMetrics } from '@/lib/dashboardMetrics';

export default function CampaignDetail() {
  const { campaignId } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resumo');
  const [selectedNiche, setSelectedNiche] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    // Simulação de dados da campanha
    const mockCampaign = {
      id: campaignId,
      name: 'Survey Test',
      mainMetric: 'NPS',
      redirectEnabled: true,
      redirectRule: 'promotores',
      googlePlaceId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
      feedbackEnabled: false,
      feedbackText: '',
      questions: [
        {
          id: 1,
          type: 'like_dislike',
          text: 'Com que frequência você utiliza os serviços da empresa?',
          order: 1,
        },
        {
          id: 2,
          type: 'emotion_scale',
          text: 'O site é fácil de usar e navegar?',
          order: 2,
        },
        {
          id: 3,
          type: 'emotion',
          text: 'O atendimento ao cliente é satisfatório?',
          order: 3,
        },
        {
          id: 4,
          type: 'stars',
          text: 'Você considera a variedade de produtos adequada às suas necessidades?',
          order: 4,
        },
        {
          id: 5,
          type: 'nps',
          text: 'Quanto você recomendaria a empresa para um amigo ou colega?',
          order: 5,
          isMain: true,
        },
      ],
    };

    setTimeout(() => {
      setCampaign(mockCampaign);
      
      // Buscar respostas da campanha
      const responses = api.getResponses(campaignId);
      setParticipants(responses);
      
      // Calcular métricas da campanha
      const metrics = calculateCampaignMetrics(campaignId, responses, mockCampaign);
      setDashboardData(metrics);
      
      setLoading(false);
    }, 500);
  }, [campaignId]);

  // Calcular sugestões diretamente do estado
  const suggestedQuestions = selectedNiche ? (questionSuggestions[selectedNiche] || []) : [];
  
  console.log('selectedNiche:', selectedNiche);
  console.log('suggestedQuestions:', suggestedQuestions);

  const questionTypes = {
    nps: 'NPS',
    stars: 'Estrelas',
    emotion: 'Emoção',
    emotion_scale: 'Escala de Emoção',
    like_dislike: 'Curtiu / Não Curtiu',
  };

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      type: 'nps',
      text: '',
      order: campaign.questions.length + 1,
    };
    setCampaign({
      ...campaign,
      questions: [...campaign.questions, newQuestion],
    });
  };

  const addSuggestedQuestion = (suggestedQuestion) => {
    const newQuestion = {
      id: Date.now(),
      type: suggestedQuestion.type,
      text: suggestedQuestion.text,
      order: campaign.questions.length + 1,
      isMain: suggestedQuestion.isMain || false,
    };
    setCampaign({
      ...campaign,
      questions: [...campaign.questions, newQuestion],
    });
  };

  const removeQuestion = (questionId) => {
    setCampaign({
      ...campaign,
      questions: campaign.questions.filter((q) => q.id !== questionId),
    });
  };

  const updateQuestion = (questionId, field, value) => {
    setCampaign({
      ...campaign,
      questions: campaign.questions.map((q) =>
        q.id === questionId ? { ...q, [field]: value } : q
      ),
    });
  };

  const renderQuestionPreview = (question) => {
    switch (question.type) {
      case 'nps':
        return (
          <div className="space-y-4">
            <p className="text-sm font-medium">{question.text || 'Pergunta sem texto'}</p>
            <div className="flex flex-wrap gap-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <div
                  key={num}
                  className={`w-8 h-8 rounded flex items-center justify-center text-xs font-semibold ${
                    num <= 6
                      ? 'bg-red-100 text-red-700'
                      : num <= 8
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {num}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Muito improvável</span>
              <span>Muito provável</span>
            </div>
          </div>
        );

      case 'stars':
        return (
          <div className="space-y-4">
            <p className="text-sm font-medium">{question.text || 'Pergunta sem texto'}</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((num) => (
                <Star key={num} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </div>
        );

      case 'emotion_scale':
        return (
          <div className="space-y-4">
            <p className="text-sm font-medium">{question.text || 'Pergunta sem texto'}</p>
            <div className="flex gap-2">
              {['😡', '😟', '😐', '😊', '😄'].map((emoji, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded">
                  <span className="text-2xl">{emoji}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'emotion':
        return (
          <div className="space-y-4">
            <p className="text-sm font-medium">{question.text || 'Pergunta sem texto'}</p>
            <div className="flex gap-4">
              {['😞', '😐', '😊'].map((emoji, idx) => (
                <div key={idx} className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                  <span className="text-2xl">{emoji}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'like_dislike':
        return (
          <div className="space-y-4">
            <p className="text-sm font-medium">{question.text || 'Pergunta sem texto'}</p>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                <ThumbsDown className="w-6 h-6 text-gray-400" />
              </div>
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                <ThumbsUp className="w-6 h-6 text-gray-400" />
              </div>
            </div>
          </div>
        );

      default:
        return <p className="text-sm text-gray-500">Tipo de pergunta desconhecido</p>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Campanha não encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{campaign.name}</h1>
        <p className="text-muted-foreground">Gerencie sua campanha de pesquisa</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="participantes">Participantes</TabsTrigger>
          <TabsTrigger value="perguntas">Perguntas</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="space-y-4">
          {/* Cards de Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nota NPS</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{dashboardData?.nps || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {(dashboardData?.nps || 0) >= 50 ? 'Excelente' : (dashboardData?.nps || 0) >= 0 ? 'Bom' : 'Precisa melhorar'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Respostas</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{dashboardData?.responseRate.toFixed(1) || 0}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {participants.length} respostas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Abertura</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{dashboardData?.openRate.toFixed(1) || 0}%</div>
                <p className="text-xs text-muted-foreground mt-1">Emails abertos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Erro</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{dashboardData?.errorRate.toFixed(1) || 0}%</div>
                <p className="text-xs text-muted-foreground mt-1">Emails com erro</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Rosca - Porcentagem NPS */}
            <Card>
              <CardHeader>
                <CardTitle>Porcentagem NPS</CardTitle>
                <CardDescription>Distribuição de Promotores, Passivos e Detratores</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData && dashboardData.npsPercentage ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={dashboardData.npsPercentage}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={(entry) => `${entry.category}: ${entry.value}%`}
                      >
                        {dashboardData.npsPercentage.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    Nenhum dado disponível
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Gráfico de Barras - Notas NPS */}
            <Card>
              <CardHeader>
                <CardTitle>Notas NPS</CardTitle>
                <CardDescription>Distribuição de notas de 0 a 10</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData && dashboardData.npsScores ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dashboardData.npsScores}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="score" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    Nenhum dado disponível
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="participantes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Participantes</CardTitle>
              <CardDescription>Lista de participantes da pesquisa ({participants.length})</CardDescription>
            </CardHeader>
            <CardContent>
              {participants.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhum participante ainda. Compartilhe o link da pesquisa com seus clientes!
                </div>
              ) : (
                <div className="space-y-4">
                  {participants.map((participant, index) => {
                    const npsQuestion = campaign.questions.find(q => q.isMain);
                    const score = npsQuestion ? participant.answers[npsQuestion.id] : null;
                    let category = 'N/A';
                    let categoryColor = 'bg-gray-100 text-gray-700 border-gray-200';
                    
                    if (score !== null && score !== undefined) {
                      if (score >= 9) {
                        category = 'Promotor';
                        categoryColor = 'bg-green-100 text-green-700 border-green-200';
                      } else if (score >= 7) {
                        category = 'Passivo';
                        categoryColor = 'bg-yellow-100 text-yellow-700 border-yellow-200';
                      } else {
                        category = 'Detrator';
                        categoryColor = 'bg-red-100 text-red-700 border-red-200';
                      }
                    }
                    
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-green-700 font-semibold">
                              {participant.customerName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{participant.customerName}</div>
                            <div className="text-sm text-gray-500">{participant.customerPhone}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm text-gray-500">
                              {new Date(participant.submittedAt).toLocaleDateString('pt-BR')}
                            </div>
                            <div className="text-sm font-medium">Nota: {score !== null ? score : 'N/A'}</div>
                          </div>
                          <div
                            className={`px-3 py-1 rounded-full text-sm font-medium border ${categoryColor}`}
                          >
                            {category}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="perguntas" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lado Esquerdo: Gerenciamento de Perguntas */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Selecione o Nicho</CardTitle>
                  <CardDescription>Escolha o nicho para ver sugestões de perguntas</CardDescription>
                </CardHeader>
                <CardContent>
                  <select
                    value={selectedNiche}
                    onChange={(e) => setSelectedNiche(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="">Selecione um nicho</option>
                    {niches.map((niche) => (
                      <option key={niche.id} value={niche.id}>
                        {niche.name}
                      </option>
                    ))}
                  </select>
                </CardContent>
              </Card>

              {suggestedQuestions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Perguntas Sugeridas</CardTitle>
                    <CardDescription>Clique no botão + para adicionar uma pergunta</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {suggestedQuestions.map((question, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">{question.text}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Tipo: {questionTypes[question.type]}
                            {question.isMain && ' • Principal'}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => addSuggestedQuestion(question)}
                          className="shrink-0"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Perguntas da Campanha</CardTitle>
                  <CardDescription>Gerencie as perguntas da sua campanha</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {campaign.questions.map((question) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <GripVertical className="w-5 h-5 text-gray-400 mt-1" />
                        <div className="flex-1 space-y-3">
                          <div className="space-y-2">
                            <Label>Texto da pergunta</Label>
                            <Input
                              value={question.text}
                              onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                              placeholder="Digite a pergunta"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Tipo de pergunta</Label>
                            <select
                              value={question.type}
                              onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                              className="w-full px-3 py-2 border border-input rounded-md bg-background"
                            >
                              {Object.entries(questionTypes).map(([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          </div>
                          {question.isMain && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                Pergunta Principal
                              </span>
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeQuestion(question.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button onClick={addQuestion} className="w-full" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar pergunta
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Lado Direito: Visualização em Tempo Real */}
            <div className="space-y-4">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Visualização do Formulário</CardTitle>
                  <CardDescription>Veja como o formulário ficará para o cliente</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg space-y-6 max-h-[600px] overflow-y-auto">
                    <div className="text-center space-y-2">
                      <h2 className="text-xl font-bold">Olá, obrigado por ser nosso cliente!</h2>
                      <p className="text-sm text-gray-600">
                        Gostaríamos de aperfeiçoar a sua experiência com os nossos serviços através deste
                        questionário que dura apenas 60 segundos.
                      </p>
                    </div>

                    {campaign.questions.length === 0 ? (
                      <p className="text-center text-gray-500 text-sm">
                        Nenhuma pergunta adicionada ainda
                      </p>
                    ) : (
                      campaign.questions.map((question, index) => (
                        <div key={question.id} className="bg-white p-4 rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Pergunta {index + 1}</span>
                            {question.isMain && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                Principal
                              </span>
                            )}
                          </div>
                          {renderQuestionPreview(question)}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="configuracoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>Configure detalhes de sua campanha</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Link da Campanha</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Compartilhe este link com seus clientes para que eles possam responder à pesquisa
                </p>
                <div className="flex gap-2">
                  <Input
                    value={`${window.location.origin}/survey/${campaign.id}`}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/survey/${campaign.id}`);
                      alert('Link copiado para a área de transferência!');
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(`/survey/${campaign.id}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Nome da campanha</Label>
                  <Input
                    value={campaign.name}
                    onChange={(e) => setCampaign({ ...campaign, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Métrica principal</Label>
                  <select
                    value={campaign.mainMetric}
                    onChange={(e) => setCampaign({ ...campaign, mainMetric: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="NPS">NPS</option>
                    <option value="CSAT">CSAT</option>
                    <option value="CES">CES</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Redirecionamento para o Google</CardTitle>
              <CardDescription>Defina se os participantes serão redirecionados para o Google</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Ativado</Label>
                <Switch
                  checked={campaign.redirectEnabled}
                  onCheckedChange={(checked) =>
                    setCampaign({ ...campaign, redirectEnabled: checked })
                  }
                />
              </div>
              {campaign.redirectEnabled && (
                <>
                  <div className="space-y-2">
                    <Label>Google Place ID</Label>
                    <p className="text-sm text-gray-500 mb-2">
                      Insira o Place ID da sua empresa no Google para redirecionar clientes.
                      <a 
                        href="https://developers.google.com/maps/documentation/places/web-service/place-id" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline ml-1"
                      >
                        Como encontrar?
                      </a>
                    </p>
                    <Input
                      value={campaign.googlePlaceId || ''}
                      onChange={(e) => setCampaign({ ...campaign, googlePlaceId: e.target.value })}
                      placeholder="Ex: ChIJN1t_tDeuEmsRUsoyG83frY4"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Regra para redirecionamento</Label>
                  <select
                    value={campaign.redirectRule}
                    onChange={(e) => setCampaign({ ...campaign, redirectRule: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="todos">Todos</option>
                    <option value="promotores">Promotores</option>
                    <option value="passivos">Passivos</option>
                    <option value="detratores">Detratores</option>
                  </select>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mensagem de feedback</CardTitle>
              <CardDescription>Defina se os participantes podem enviar um texto de feedback</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Desativado</Label>
                <Switch
                  checked={campaign.feedbackEnabled}
                  onCheckedChange={(checked) =>
                    setCampaign({ ...campaign, feedbackEnabled: checked })
                  }
                />
              </div>
              {campaign.feedbackEnabled && (
                <div className="space-y-2">
                  <Label>Texto da pergunta</Label>
                  <Textarea
                    value={campaign.feedbackText}
                    onChange={(e) => setCampaign({ ...campaign, feedbackText: e.target.value })}
                    placeholder="Você gostaria de deixar algum feedback para nós?"
                    rows={3}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button className="gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
              </svg>
              Salvar
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

