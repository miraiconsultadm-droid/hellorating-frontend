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
      alert('Erro ao salvar detalhes da campanha. Verifique o console para detalhes.');
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
      await api.updateCampaign(campaign.id, { ...campaign, questions: campaign.questions });
      alert('Perguntas salvas com sucesso!');
    } catch (error) {
      console.error('Error saving questions:', error);
      alert('Erro ao salvar perguntas. Verifique o console para detalhes.');
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

  const surveyLink = `${window.location.origin}/survey/${campaign.id}`;

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

        <TabsContent value="resumo" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Visão Geral</CardTitle>
                <CardDescription>Métricas e desempenho da campanha.</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">NPS Score</p>
                      <p className="text-3xl font-bold text-green-600">{dashboardData.nps}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Respostas</p>
                      <p className="text-3xl font-bold">{dashboardData.responses}</p>
                    </div>
                    <div className="md:col-span-2">
                      <h3 className="text-lg font-semibold mb-2">Distribuição NPS</h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={dashboardData.npsPercentage}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {dashboardData.npsPercentage.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value}%`} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex justify-center gap-4 mt-2">
                        {dashboardData.npsPercentage.map((entry, index) => (
                          <div key={index} className="flex items-center">
                            <span className="inline-block w-3 h-3 rounded-full mr-2"
                                  style={{ backgroundColor: entry.color }}></span>
                            <span className="text-sm text-gray-600">{entry.category} ({entry.value}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <h3 className="text-lg font-semibold mb-2">Pontuações NPS</h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={dashboardData.npsScores}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="score" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum dado de dashboard disponível ainda.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Link da Pesquisa</CardTitle>
                <CardDescription>Compartilhe este link para coletar respostas.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Input type="text" value={surveyLink} readOnly className="flex-grow" />
                  <Button
                    onClick={() => navigator.clipboard.writeText(surveyLink)}
                    variant="outline"
                    size="icon"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <Button asChild className="w-full">
                  <a href={surveyLink} target="_blank" rel="noopener noreferrer">
                    Abrir Pesquisa <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="participantes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Participantes Recentes</CardTitle>
              <CardDescription>Últimas respostas recebidas.</CardDescription>
            </CardHeader>
            <CardContent>
              {participants.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {participants.map((p) => (
                        <tr key={p.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.cliente_nome || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.cliente_email || 'N/A'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.nota_nps}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              p.nota_nps >= 9 ? 'bg-green-100 text-green-800' :
                              p.nota_nps >= 7 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {p.nota_nps >= 9 ? 'Promotor' : (p.nota_nps >= 7 ? 'Passivo' : 'Detrator')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum participante registrado ainda.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="perguntas" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Perguntas da Campanha</CardTitle>
              <CardDescription>Defina as perguntas para sua pesquisa.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {campaign.questions && campaign.questions.length > 0 ? (
                campaign.questions.map((question) => (
                  <Card key={question.id} className="relative group">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
                          <Label className="text-sm font-semibold">Pergunta {question.order} ({questionTypes[question.type]})</Label>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeQuestion(question.id)}
                          className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Label htmlFor={`question-text-${question.id}`}>Texto da Pergunta</Label>
                          <Input
                            id={`question-text-${question.id}`}
                            value={question.text}
                            onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                            placeholder="Digite a pergunta"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`question-type-${question.id}`}>Tipo da Pergunta</Label>
                          <select
                            id={`question-type-${question.id}`}
                            value={question.type}
                            onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                            className="w-full px-3 py-2 border border-input rounded-md bg-background mt-1"
                          >
                            {Object.entries(questionTypes).map(([key, value]) => (
                              <option key={key} value={key}>{value}</option>
                            ))}
                          </select>
                        </div>

                        {/* Renderização condicional para opções de pergunta */}
                        {(question.type === 'emotion_scale' || question.type === 'emotion') && (
                          <div>
                            <Label>Opções de Emoção (Emoji e Rótulo)</Label>
                            <div className="space-y-2 mt-1">
                              {question.options && question.options.map((option, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                  <Input
                                    value={option.emoji}
                                    onChange={(e) => {
                                      const newOptions = [...question.options];
                                      newOptions[index].emoji = e.target.value;
                                      updateQuestion(question.id, 'options', newOptions);
                                    }}
                                    placeholder="Emoji"
                                    className="w-20"
                                  />
                                  {question.type === 'emotion_scale' && (
                                    <Input
                                      value={option.label || ''}
                                      onChange={(e) => {
                                        const newOptions = [...question.options];
                                        newOptions[index].label = e.target.value;
                                        updateQuestion(question.id, 'options', newOptions);
                                      }}
                                      placeholder="Rótulo"
                                      className="flex-grow"
                                    />
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      const newOptions = question.options.filter((_, i) => i !== index);
                                      updateQuestion(question.id, 'options', newOptions);
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newOptions = [...(question.options || []), { emoji: '', label: '' }];
                                  updateQuestion(question.id, 'options', newOptions);
                                }}
                              >
                                Adicionar Opção
                              </Button>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between mt-2">
                          <div className="space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => moveQuestionUp(question.id)}
                              disabled={question.order === 1}
                            >
                              Mover para Cima
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => moveQuestionDown(question.id)}
                              disabled={question.order === campaign.questions.length}
                            >
                              Mover para Baixo
                            </Button>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Label htmlFor={`is-main-${question.id}`}>Principal</Label>
                            <Switch
                              id={`is-main-${question.id}`}
                              checked={question.isMain || false}
                              onCheckedChange={(checked) => updateQuestion(question.id, 'isMain', checked)}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <div className="p-4 border-t bg-gray-50">
                      <h4 className="text-sm font-semibold mb-2">Pré-visualização</h4>
                      {renderQuestionPreview(question)}
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-muted-foreground">Nenhuma pergunta adicionada ainda.</p>
              )}

              <div className="flex gap-4">
                <Button onClick={addQuestion} className="bg-blue-600 hover:bg-blue-700 text-white flex-1">
                  <Plus className="w-4 h-4 mr-2" /> Adicionar Pergunta Manualmente
                </Button>
                
                <div className="flex-1">
                  <select
                    value={selectedNiche}
                    onChange={(e) => setSelectedNiche(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="">Sugestões por Nicho</option>
                    {niches.map((niche) => (
                      <option key={niche.id} value={niche.id}>
                        {niche.name}
                      </option>
                    ))}
                  </select>
                  {selectedNiche && suggestedQuestions.length > 0 && (
                    <div className="mt-2 p-3 border rounded-md bg-gray-50 max-h-40 overflow-y-auto">
                      <h5 className="text-sm font-semibold mb-2">Perguntas Sugeridas para {niches.find(n => n.id === selectedNiche)?.name}</h5>
                      {suggestedQuestions.map((sq, index) => (
                        <div key={index} className="flex justify-between items-center text-sm py-1">
                          <span>{sq.text} ({questionTypes[sq.type]})</span>
                          <Button variant="ghost" size="sm" onClick={() => addSuggestedQuestion(sq)}>
                            <Plus className="w-4 h-4" /> Adicionar
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Button onClick={saveQuestions} className="w-full bg-green-600 hover:bg-green-700 text-white">
                Salvar Perguntas
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuracoes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações da Campanha</CardTitle>
              <CardDescription>Ajuste as configurações gerais da sua campanha.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="campaignName">Nome da Campanha</Label>
                <Input
                  id="campaignName"
                  value={campaign.name}
                  onChange={(e) => handleCampaignDataChange('name', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="mainMetric">Métrica Principal</Label>
                <select
                  id="mainMetric"
                  value={campaign.mainMetric}
                  onChange={(e) => handleCampaignDataChange('mainMetric', e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background mt-1"
                >
                  <option value="NPS">NPS (Net Promoter Score)</option>
                  <option value="CSAT">CSAT (Customer Satisfaction)</option>
                  <option value="CES">CES (Customer Effort Score)</option>
                </select>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <Label htmlFor="redirectEnabled">Redirecionamento para Google</Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Redirecionar clientes para deixarem avaliação no Google
                    </p>
                  </div>
                  <Switch
                    id="redirectEnabled"
                    checked={campaign.redirectEnabled}
                    onCheckedChange={(checked) =>
                      handleCampaignDataChange('redirectEnabled', checked)
                    }
                  />
                </div>
                {campaign.redirectEnabled && (
                  <div>
                    <Label htmlFor="redirectRule">Quem deve ser redirecionado?</Label>
                    <select
                      id="redirectRule"
                      value={campaign.redirectRule}
                      onChange={(e) => handleCampaignDataChange('redirectRule', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background mt-1"
                    >
                      <option value="promotores">Apenas Promotores (9-10)</option>
                      <option value="passivos">Apenas Passivos (7-8)</option>
                      <option value="detratores">Apenas Detratores (0-6)</option>
                      <option value="todos">Todos os respondentes</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <Label htmlFor="feedbackEnabled">Mensagem de Feedback</Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Exibir mensagem personalizada após a pesquisa
                    </p>
                  </div>
                  <Switch
                    id="feedbackEnabled"
                    checked={campaign.feedbackEnabled}
                    onCheckedChange={(checked) =>
                      handleCampaignDataChange('feedbackEnabled', checked)
                    }
                  />
                </div>
                {campaign.feedbackEnabled && (
                  <div>
                    <Label htmlFor="feedbackText">Texto da Mensagem</Label>
                    <Textarea
                      id="feedbackText"
                      placeholder="Digite a mensagem que será exibida ao cliente"
                      value={campaign.feedbackText}
                      onChange={(e) => handleCampaignDataChange('feedbackText', e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                )}
              </div>

              <Button onClick={handleSaveCampaignDetails} className="w-full bg-green-600 hover:bg-green-700 text-white">
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

