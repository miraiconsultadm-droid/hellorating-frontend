import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Eye, AlertCircle, Mail, Plus, Trash2, GripVertical, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resumo');
  const [campaign, setCampaign] = useState(null);

  useEffect(() => {
    // Buscar dados do dashboard da primeira campanha
    const fetchDashboard = async () => {
      try {
        const campaigns = await api.getCampaigns();
        if (campaigns.length > 0) {
          const data = await api.getDashboardData(campaigns[0].id);
          setDashboardData(data);
          
          // Buscar dados da campanha
          const campaignData = await api.getCampaign(campaigns[0].id);
          const questions = await api.getCampaignQuestions(campaigns[0].id);
          setCampaign({
            ...campaignData,
            questions: questions
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Promotor':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Passivo':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Detrator':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!dashboardData || !campaign) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Nenhum dado disponível</p>
      </div>
    );
  }

  // Dados para o gráfico de rosca (donut)
  const donutData = dashboardData.npsPercentage.map(item => ({
    name: item.category,
    value: parseFloat(item.value),
    color: item.color
  }));

  const COLORS = {
    'Promotores': '#10b981',
    'Passivos': '#f59e0b',
    'Detratores': '#ef4444'
  };

  return (
    <div className="space-y-6">
      {/* Título da campanha */}
      <div>
        <h1 className="text-2xl font-bold">{campaign.name}</h1>
      </div>

      {/* Abas */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          <button 
            onClick={() => setActiveTab('resumo')}
            className={`pb-3 border-b-2 font-medium text-sm ${
              activeTab === 'resumo' 
                ? 'border-green-500 text-gray-900' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Resumo
          </button>
          <button 
            onClick={() => setActiveTab('participantes')}
            className={`pb-3 border-b-2 font-medium text-sm ${
              activeTab === 'participantes' 
                ? 'border-green-500 text-gray-900' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Participantes
          </button>
          <button 
            onClick={() => setActiveTab('perguntas')}
            className={`pb-3 border-b-2 font-medium text-sm ${
              activeTab === 'perguntas' 
                ? 'border-green-500 text-gray-900' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Perguntas
          </button>
          <button 
            onClick={() => setActiveTab('configuracoes')}
            className={`pb-3 border-b-2 font-medium text-sm ${
              activeTab === 'configuracoes' 
                ? 'border-green-500 text-gray-900' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Configurações
          </button>
        </nav>
      </div>

      {/* Conteúdo das Abas */}
      {activeTab === 'resumo' && (
        <div className="space-y-6">
          {/* Cards de métricas principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Nota NPS</CardTitle>
                <TrendingUp className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{dashboardData.nps.toFixed(0)}</div>
                <p className="text-xs text-gray-500 mt-1">Sua nota está Excelente</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Taxa de Respostas</CardTitle>
                <Eye className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{dashboardData.responseRate.toFixed(2)}%</div>
                <p className="text-xs text-gray-500 mt-1">1 visualizador de 1</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Taxa de Abertura</CardTitle>
                <Mail className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">100.00%</div>
                <p className="text-xs text-gray-500 mt-1">1 visualizador de 1</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Taxa de Erro</CardTitle>
                <AlertCircle className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0.00%</div>
                <p className="text-xs text-gray-500 mt-1">0 com erro / 0 marcados spam</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Rosca (Donut) - Porcentagem */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Porcentagem</CardTitle>
                <CardDescription className="text-sm text-gray-500">Porcentagem de promotores, neutros e detratores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <ResponsiveContainer width="50%" height={200}>
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {donutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[entry.name] || entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-semibold">Promotores: </span>
                      <span className="text-gray-600">{donutData.find(d => d.name === 'Promotores')?.value.toFixed(2) || 0}%</span>
                    </div>
                    <div>
                      <span className="font-semibold">Neutros: </span>
                      <span className="text-gray-600">{donutData.find(d => d.name === 'Passivos')?.value.toFixed(2) || 0}%</span>
                    </div>
                    <div>
                      <span className="font-semibold">Detratores: </span>
                      <span className="text-gray-600">{donutData.find(d => d.name === 'Detratores')?.value.toFixed(2) || 0}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gráfico de Barras - Quantidade por opção */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Quantidade por opção</CardTitle>
                <CardDescription className="text-sm text-gray-500">Número de avaliações por opção</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={dashboardData.npsScores}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="score" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {dashboardData.npsScores.map((entry, index) => {
                        const score = parseInt(entry.score);
                        let color = '#10b981'; // Verde (Promotor)
                        if (score <= 6) color = '#ef4444'; // Vermelho (Detrator)
                        else if (score <= 8) color = '#f59e0b'; // Amarelo (Passivo)
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Últimas Respostas */}
          <Card className="border border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Últimas Respostas</CardTitle>
                <CardDescription className="text-sm text-gray-500">Últimas respostas da campanha</CardDescription>
              </div>
              <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                Ver todas
              </button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.latestResponses.map((response) => (
                  <div key={response.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-sm font-semibold">
                        {response.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{response.name}</p>
                        <p className="text-xs text-gray-500">{response.email}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(response.category)}`}>
                      {response.score} - {response.category}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'participantes' && (
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle>Participantes</CardTitle>
            <CardDescription>Lista de participantes da campanha</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Lista de participantes aparecerá aqui.</p>
          </CardContent>
        </Card>
      )}

      {activeTab === 'perguntas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Perguntas</h2>
              <p className="text-sm text-gray-500 mt-1">
                {campaign.questions.length} de 5 perguntas
              </p>
            </div>
            <Button onClick={addQuestion} className="gap-2 bg-green-500 hover:bg-green-600">
              <Plus className="h-4 w-4" />
              Adicionar pergunta
            </Button>
          </div>

          <div className="space-y-4">
            {campaign.questions.map((question, index) => (
              <Card key={question.id} className="border border-gray-200">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <GripVertical className="h-5 w-5 text-gray-400 mt-1 cursor-move" />
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600">
                            Pergunta {index + 1}
                          </span>
                          {question.isMain && (
                            <span className="px-2 py-0.5 bg-black text-white rounded text-xs font-medium">
                              Principal
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeQuestion(question.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
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
                          className="w-full px-3 py-2 border border-gray-200 rounded-md bg-white"
                        >
                          {Object.entries(questionTypes).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'configuracoes' && (
        <div className="space-y-4">
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Configurações Gerais</CardTitle>
              <CardDescription className="text-sm text-gray-500">Configure detalhes de sua campanha</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Nome da campanha</Label>
                <Input
                  value={campaign.name}
                  onChange={(e) => setCampaign({ ...campaign, name: e.target.value })}
                />
              </div>
              
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
              
              <div className="space-y-2">
                <Label>Forma de envio</Label>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 border-2 border-green-500 bg-green-50 rounded-lg">
                    <Mail className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">E-mail</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg relative">
                    <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
                    </svg>
                    <span className="text-sm font-medium text-gray-600">Link</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg relative">
                    <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span className="text-sm font-medium text-gray-600">WhatsApp</span>
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-medium rounded">Em breve</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Redirecionamento para o Google</CardTitle>
              <CardDescription className="text-sm text-gray-500">Defina se os participantes serão redirecionados para o Google</CardDescription>
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
                    className="w-full px-3 py-2 border border-gray-200 rounded-md bg-white"
                  >
                    <option value="todos">Redirecionar todos</option>
                    <option value="promotores">Apenas Promotores</option>
                    <option value="passivos">Apenas Passivos</option>
                    <option value="detratores">Apenas Detratores</option>
                  </select>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Mensagem de feedback</CardTitle>
              <CardDescription className="text-sm text-gray-500">Defina se os participantes podem enviar um texto de feedback</CardDescription>
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
            <Button className="gap-2 bg-green-500 hover:bg-green-600">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
              </svg>
              Salvar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

