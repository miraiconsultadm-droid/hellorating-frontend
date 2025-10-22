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
    const fetchCampaign = async () => {
      try {
        const fetchedCampaign = await api.getCampaign(campaignId);
        setCampaign(fetchedCampaign);

        // Buscar respostas da campanha
        // const responses = await api.getResponses(campaignId); // Assumindo que getResponses agora busca do backend
        // setParticipants(responses);
        
        // Temporariamente usando mock de respostas para o dashboard, pois api.getResponses ainda não foi ajustado para o backend
        const mockResponses = [
          { id: 1, campanha_id: campaignId, cliente_email: 'test1@example.com', respostas: [{ questionId: 5, value: 9 }], nota_nps: 9, cliente_nome: 'Cliente Um' },
          { id: 2, campanha_id: campaignId, cliente_email: 'test2@example.com', respostas: [{ questionId: 5, value: 7 }], nota_nps: 7, cliente_nome: 'Cliente Dois' },
          { id: 3, campanha_id: campaignId, cliente_email: 'test3@example.com', respostas: [{ questionId: 5, value: 3 }], nota_nps: 3, cliente_nome: 'Cliente Três' },
        ];
        setParticipants(mockResponses);

        // Calcular métricas da campanha
        const metrics = calculateCampaignMetrics(campaignId, mockResponses, fetchedCampaign);
        setDashboardData(metrics);

      } catch (error) {
        console.error('Error fetching campaign or dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [campaignId]);

  // Calcular sugestões diretamente do estado
  const suggestedQuestions = selectedNiche ? (questionSuggestions[selectedNiche] || []) : [];
  
  const questionTypes = {
    nps: 'NPS',
    stars: 'Estrelas',
    emotion: 'Emoção',
    emotion_scale: 'Escala de Emoção',
    like_dislike: 'Curtiu / Não Curtiu',
  };

  const handleCampaignDataChange = (field, value) => {
    setCampaign(prevCampaign => ({
      ...prevCampaign,
      [field]: value,
    }));
  };

  const handleSaveCampaignDetails = async () => {
    try {
      await api.updateCampaign(campaign.id, campaign);
      alert('Detalhes da campanha salvos com sucesso!');
    } catch (error) {
      console.error('Error saving campaign details:', error);
      
      // Extrair mensagem de erro detalhada
      let errorMessage = 'Erro ao salvar detalhes da campanha.';
      
      if (error.details && Array.isArray(error.details)) {
        // Se houver detalhes de validação
        errorMessage += '\n\nProblemas encontrados:\n' + error.details.join('\n');
      } else if (error.message) {
        // Se houver uma mensagem de erro específica
        errorMessage += `\n\n${error.message}`;
      }
      
      if (error.status === 400) {
        errorMessage = 'Dados inválidos. ' + errorMessage;
      } else if (error.status === 500) {
        errorMessage = 'Erro no servidor. ' + errorMessage;
      } else if (!error.status) {
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      }
      
      alert(errorMessage);
    }
  };

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      type: 'nps',
      text: '',
      order: (campaign.questions?.length || 0) + 1,
    };
    setCampaign({
      ...campaign,
      questions: [...(campaign.questions || []), newQuestion],
    });
  };

  const addSuggestedQuestion = (suggestedQuestion) => {
    const newQuestion = {
      id: Date.now(),
      type: suggestedQuestion.type,
      text: suggestedQuestion.text,
      options: suggestedQuestion.options || null,
      order: (campaign.questions?.length || 0) + 1,
      isMain: suggestedQuestion.isMain || false,
    };
    setCampaign({
      ...campaign,
      questions: [...(campaign.questions || []), newQuestion],
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

  const moveQuestionUp = (questionId) => {
    const index = campaign.questions.findIndex((q) => q.id === questionId);
    if (index > 0) {
      const newQuestions = [...campaign.questions];
      [newQuestions[index - 1], newQuestions[index]] = [newQuestions[index], newQuestions[index - 1]];
      // Atualizar a ordem
      newQuestions.forEach((q, idx) => {
        q.order = idx + 1;
      });
      setCampaign({ ...campaign, questions: newQuestions });
    }
  };

  const moveQuestionDown = (questionId) => {
    const index = campaign.questions.findIndex((q) => q.id === questionId);
    if (index < campaign.questions.length - 1) {
      const newQuestions = [...campaign.questions];
      [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];
      // Atualizar a ordem
      newQuestions.forEach((q, idx) => {
        q.order = idx + 1;
      });
      setCampaign({ ...campaign, questions: newQuestions });
    }
  };

  const saveQuestions = async () => {
    try {
      // Validar que há pelo menos uma pergunta
      if (!campaign.questions || campaign.questions.length === 0) {
        alert('Adicione pelo menos uma pergunta antes de salvar.');
        return;
      }
      
      // Validar que todas as perguntas têm texto
      const questionsWithoutText = campaign.questions.filter(q => !q.text || q.text.trim() === '');
      if (questionsWithoutText.length > 0) {
        alert(`${questionsWithoutText.length} pergunta(s) sem texto. Por favor, preencha o texto de todas as perguntas.`);
        return;
      }
      
      await api.updateCampaign(campaign.id, { ...campaign, questions: campaign.questions });
      alert('Perguntas salvas com sucesso!');
    } catch (error) {
      console.error('Error saving questions:', error);
      
      // Extrair mensagem de erro detalhada
      let errorMessage = 'Erro ao salvar perguntas.';
      
      if (error.details && Array.isArray(error.details)) {
        errorMessage += '\n\nProblemas encontrados:\n' + error.details.join('\n');
      } else if (error.message) {
        errorMessage += `\n\n${error.message}`;
      }
      
      if (error.status === 400) {
        errorMessage = 'Dados inválidos. ' + errorMessage;
      } else if (error.status === 500) {
        errorMessage = 'Erro no servidor. ' + errorMessage;
      } else if (!error.status) {
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      }
      
      alert(errorMessage);
    }
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
              {question.options && question.options.length > 0 ? (
                question.options.map((option, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded">
                    <span className="text-2xl">{option.emoji}</span>
                    {option.label && <span className="text-xs text-gray-600">{option.label}</span>}
                  </div>
                ))
              ) : ([
                <div key="1" className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded"><span className="text-2xl">😡</span></div>,
                <div key="2" className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded"><span className="text-2xl">😕</span></div>,
                <div key="3" className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded"><span className="text-2xl">😐</span></div>,
                <div key="4" className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded"><span className="text-2xl">🙂</span></div>,
                <div key="5" className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded"><span className="text-2xl">😄</span></div>,
              ])}
            </div>
          </div>
        );

      case 'emotion':
        return (
          <div className="space-y-4">
            <p className="text-sm font-medium">{question.text || 'Pergunta sem texto'}</p>
            <div className="flex gap-4">
              {question.options && question.options.length > 0 ? (
                question.options.map((option, idx) => (
                  <div key={idx} className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                    <span className="text-2xl">{option.emoji}</span>
                  </div>
                ))
              ) : ([
                <div key="1" className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center"><span className="text-2xl">😞</span></div>,
                <div key="2" className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center"><span className="text-2xl">😐</span></div>,
                <div key="3" className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center"><span className="text-2xl">😊</span></div>,
              ])}
            </div>
          </div>
        );

      case 'like_dislike':
        return (
          <div className="space-y-4">
            <p className="text-sm font-medium">{question.text || 'Pergunta sem texto'}</p>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                <ThumbsUp className="w-6 h-6 text-green-500" />
              </div>
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                <ThumbsDown className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <p className="text-sm font-medium">{question.text || 'Pergunta sem texto'}</p>
            <p className="text-xs text-gray-500">Tipo de pergunta: {questionTypes[question.type] || question.type}</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Carregando campanha...</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Campanha não encontrada.</p>
      </div>
    );
  }

  const surveyLink = `https://hellorating-frontend.vercel.app/survey/${campaign.id}`;

  const totalResponses = participants.length;
  const promoters = participants.filter(p => p.nota_nps >= 9).length;
  const detractors = participants.filter(p => p.nota_nps <= 6).length;
  const npsScore = totalResponses > 0 ? ((promoters - detractors) / totalResponses) * 100 : 0;

  const npsData = [
    { name: 'Promotores', value: promoters, color: '#10b981' },
    { name: 'Neutros', value: totalResponses - promoters - detractors, color: '#f59e0b' },
    { name: 'Detratores', value: detractors, color: '#ef4444' },
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Detalhes da Campanha: {campaign.name}</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
          <TabsTrigger value="perguntas">Perguntas</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Link da Pesquisa</CardTitle>
                <CardDescription>Compartilhe este link para coletar respostas.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center space-x-2">
                <Input value={surveyLink} readOnly />
                <Button onClick={() => navigator.clipboard.writeText(surveyLink)} className="shrink-0">
                  <Copy className="h-4 w-4 mr-2" /> Copiar
                </Button>
                <Button variant="outline" size="icon" asChild>
                  <a href={surveyLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas Principais</CardTitle>
                <CardDescription>Visão geral do desempenho da campanha.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-around items-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{npsScore.toFixed(0)}</p>
                    <p className="text-sm text-gray-500">NPS</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{totalResponses}</p>
                    <p className="text-sm text-gray-500">Respostas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status da Campanha</CardTitle>
                <CardDescription>Gerencie o estado atual da sua campanha.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <Label htmlFor="campaign-status" className="text-sm">Campanha {campaign.status === 'active' ? 'Ativa' : 'Inativa'}</Label>
                <Switch
                  id="campaign-status"
                  checked={campaign.status === 'active'}
                  onCheckedChange={(checked) => handleCampaignDataChange('status', checked ? 'active' : 'inactive')}
                />
              </CardContent>
            </Card>
          </div>

          {dashboardData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição do NPS</CardTitle>
                  <CardDescription>Classificação dos respondentes.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={npsData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {npsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Últimas Respostas</CardTitle>
                  <CardDescription>Visão geral das respostas recentes.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {participants.slice(0, 5).map(participant => (
                      <div key={participant.id} className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          <p className="font-medium">{participant.cliente_nome || participant.cliente_email}</p>
                          <p className="text-sm text-gray-500">NPS: {participant.nota_nps}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          participant.nota_nps >= 9 ? 'bg-green-100 text-green-800' :
                          participant.nota_nps >= 7 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {participant.nota_nps >= 9 ? 'Promotor' : participant.nota_nps >= 7 ? 'Passivo' : 'Detrator'}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="configuracoes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações da Campanha</CardTitle>
              <CardDescription>Ajuste os detalhes e o comportamento da sua campanha.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="campaign-name">Nome da Campanha</Label>
                <Input
                  id="campaign-name"
                  value={campaign.name || ''}
                  onChange={(e) => handleCampaignDataChange('name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="main-metric">Métrica Principal</Label>
                <Input
                  id="main-metric"
                  value={campaign.mainMetric || ''}
                  onChange={(e) => handleCampaignDataChange('mainMetric', e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="redirect-enabled"
                  checked={campaign.redirectEnabled}
                  onCheckedChange={(checked) => handleCampaignDataChange('redirectEnabled', checked)}
                />
                <Label htmlFor="redirect-enabled">Redirecionar para Google Review</Label>
              </div>

              {campaign.redirectEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="redirect-rule">Regra de Redirecionamento</Label>
                  <Input
                    id="redirect-rule"
                    value={campaign.redirectRule || ''}
                    onChange={(e) => handleCampaignDataChange('redirectRule', e.target.value)}
                    placeholder="Ex: promotores"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="feedback-enabled"
                  checked={campaign.feedbackEnabled}
                  onCheckedChange={(checked) => handleCampaignDataChange('feedbackEnabled', checked)}
                />
                <Label htmlFor="feedback-enabled">Habilitar Campo de Feedback</Label>
              </div>

              {campaign.feedbackEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="feedback-text">Texto do Campo de Feedback</Label>
                  <Textarea
                    id="feedback-text"
                    value={campaign.feedbackText || ''}
                    onChange={(e) => handleCampaignDataChange('feedbackText', e.target.value)}
                    placeholder="Ex: Deixe seu feedback aqui..."
                  />
                </div>
              )}

              <Button onClick={handleSaveCampaignDetails}>Salvar Detalhes da Campanha</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="perguntas" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Perguntas da Campanha</CardTitle>
              <CardDescription>Defina as perguntas que serão exibidas na pesquisa.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {campaign.questions && campaign.questions.length > 0 ? (
                  campaign.questions.map((question, index) => (
                    <Card key={question.id} className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold">Pergunta {index + 1}</h4>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => moveQuestionUp(question.id)} disabled={index === 0}>▲</Button>
                          <Button variant="outline" size="sm" onClick={() => moveQuestionDown(question.id)} disabled={index === campaign.questions.length - 1}>▼</Button>
                          <Button variant="destructive" size="sm" onClick={() => removeQuestion(question.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2 mb-4">
                        <Label htmlFor={`question-type-${question.id}`}>Tipo de Pergunta</Label>
                        <select
                          id={`question-type-${question.id}`}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={question.type}
                          onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                        >
                          {Object.entries(questionTypes).map(([key, value]) => (
                            <option key={key} value={key}>{value}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`question-text-${question.id}`}>Texto da Pergunta</Label>
                        <Input
                          id={`question-text-${question.id}`}
                          value={question.text || ''}
                          onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                          placeholder="Ex: Qual seu nível de satisfação?"
                        />
                      </div>
                      {question.type === 'emotion_scale' && (
                        <div className="space-y-2 mt-4">
                          <Label>Opções de Emoção (Emoji e Label)</Label>
                          {question.options && question.options.length > 0 ? (
                            <div className="space-y-2">
                              {question.options.map((option, optIdx) => (
                                <div key={optIdx} className="flex items-center space-x-2">
                                  <Input
                                    value={option.emoji || ''}
                                    onChange={(e) => {
                                      const newOptions = [...question.options];
                                      newOptions[optIdx] = { ...newOptions[optIdx], emoji: e.target.value };
                                      updateQuestion(question.id, 'options', newOptions);
                                    }}
                                    placeholder="Emoji (ex: 😊)"
                                    className="w-20"
                                  />
                                  <Input
                                    value={option.label || ''}
                                    onChange={(e) => {
                                      const newOptions = [...question.options];
                                      newOptions[optIdx] = { ...newOptions[optIdx], label: e.target.value };
                                      updateQuestion(question.id, 'options', newOptions);
                                    }}
                                    placeholder="Label (ex: Feliz)"
                                    className="flex-1"
                                  />
                                  <Button variant="destructive" size="sm" onClick={() => {
                                    const newOptions = question.options.filter((_, i) => i !== optIdx);
                                    updateQuestion(question.id, 'options', newOptions);
                                  }}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  updateQuestion(question.id, 'options', [...(question.options || []), { emoji: '', label: '' }]);
                                }}
                              >
                                Adicionar Opção
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                updateQuestion(question.id, 'options', [{ emoji: '😡', label: 'Muito Insatisfeito' }, { emoji: '😕', label: 'Insatisfeito' }, { emoji: '😐', label: 'Neutro' }, { emoji: '🙂', label: 'Satisfeito' }, { emoji: '😄', label: 'Muito Satisfeito' }]);
                              }}
                            >
                              Gerar Opções Padrão
                            </Button>
                          )}
                        </div>
                      )}
                      {question.type === 'emotion' && (
                        <div className="space-y-2 mt-4">
                          <Label>Opções de Emoção (Emoji)</Label>
                          {question.options && question.options.length > 0 ? (
                            <div className="space-y-2">
                              {question.options.map((option, optIdx) => (
                                <div key={optIdx} className="flex items-center space-x-2">
                                  <Input
                                    value={option.emoji || ''}
                                    onChange={(e) => {
                                      const newOptions = [...question.options];
                                      newOptions[optIdx] = { ...newOptions[optIdx], emoji: e.target.value };
                                      updateQuestion(question.id, 'options', newOptions);
                                    }}
                                    placeholder="Emoji (ex: 😊)"
                                    className="w-20"
                                  />
                                  <Button variant="destructive" size="sm" onClick={() => {
                                    const newOptions = question.options.filter((_, i) => i !== optIdx);
                                    updateQuestion(question.id, 'options', newOptions);
                                  }}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  updateQuestion(question.id, 'options', [...(question.options || []), { emoji: '' }]);
                                }}
                              >
                                Adicionar Opção
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                updateQuestion(question.id, 'options', [{ emoji: '😞' }, { emoji: '😐' }, { emoji: '😊' }]);
                              }}
                            >
                              Gerar Opções Padrão
                            </Button>
                          )}
                        </div>
                      )}
                      <div className="flex items-center space-x-2 mt-4">
                        <Switch
                          id={`question-is-main-${question.id}`}
                          checked={question.isMain || false}
                          onCheckedChange={(checked) => updateQuestion(question.id, 'isMain', checked)}
                        />
                        <Label htmlFor={`question-is-main-${question.id}`}>É a pergunta principal (NPS)</Label>
                      </div>
                      <div className="mt-4 p-3 border rounded-md bg-gray-50">
                        <p className="text-sm font-semibold mb-2">Pré-visualização:</p>
                        {renderQuestionPreview(question)}
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-gray-500">Nenhuma pergunta adicionada ainda. Clique em "Adicionar Pergunta" para começar.</p>
                )}
              </div>

              <div className="flex justify-between items-center">
                <Button onClick={addQuestion}>
                  <Plus className="h-4 w-4 mr-2" /> Adicionar Pergunta
                </Button>
                <Button onClick={saveQuestions}>Salvar Perguntas</Button>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Sugestões de Perguntas</h3>
                <div className="space-y-2">
                  <Label htmlFor="niche-select">Selecionar Nicho</Label>
                  <select
                    id="niche-select"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedNiche}
                    onChange={(e) => setSelectedNiche(e.target.value)}
                  >
                    <option value="">Selecione um nicho</option>
                    {niches.map((n) => (
                      <option key={n.value} value={n.value}>{n.label}</option>
                    ))}
                  </select>
                </div>
                {selectedNiche && suggestedQuestions.length > 0 && (
                  <div className="space-y-2">
                    {suggestedQuestions.map((sQuestion, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                        <p className="text-sm">{sQuestion.text} ({questionTypes[sQuestion.type]})</p>
                        <Button variant="outline" size="sm" onClick={() => addSuggestedQuestion(sQuestion)}>
                          Adicionar
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
