import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, GripVertical } from 'lucide-react';

export default function CampaignDetail() {
  const { campaignId } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resumo');

  useEffect(() => {
    // Simulação de dados da campanha
    const mockCampaign = {
      id: campaignId,
      name: 'Survey Test',
      mainMetric: 'NPS',
      redirectEnabled: true,
      redirectRule: 'promotores',
      feedbackEnabled: false,
      feedbackText: '',
      questions: [
        {
          id: 1,
          type: 'like_dislike',
          text: 'Com que frequência você utiliza os serviços da Netkings?',
          order: 1,
        },
        {
          id: 2,
          type: 'emotion_scale',
          text: 'O site da Netkings é fácil de usar e navegar?',
          order: 2,
        },
        {
          id: 3,
          type: 'emotion',
          text: 'O atendimento ao cliente da Netkings é satisfatório?',
          order: 3,
        },
        {
          id: 4,
          type: 'stars',
          text: 'Você considera a variedade de produtos da Netkings adequada às suas necessidades?',
          order: 4,
        },
        {
          id: 5,
          type: 'nps',
          text: 'Você recomendaria a Netkings para um amigo ou colega?',
          order: 5,
          isMain: true,
        },
      ],
    };

    setTimeout(() => {
      setCampaign(mockCampaign);
      setLoading(false);
    }, 500);
  }, [campaignId]);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{campaign.name}</h1>
        <p className="text-muted-foreground mt-1">Gerencie sua campanha de pesquisa</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="participantes">Participantes</TabsTrigger>
          <TabsTrigger value="perguntas">Perguntas</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumo da Campanha</CardTitle>
              <CardDescription>Visão geral das métricas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Métricas e gráficos da campanha aparecerão aqui.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participantes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Participantes</CardTitle>
              <CardDescription>Lista de participantes da campanha</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Lista de participantes aparecerá aqui.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="perguntas" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Perguntas</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {campaign.questions.length} de 5 perguntas
              </p>
            </div>
            <Button onClick={addQuestion} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar pergunta
            </Button>
          </div>

          <div className="space-y-4">
            {campaign.questions.map((question, index) => (
              <Card key={question.id}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <GripVertical className="h-5 w-5 text-muted-foreground mt-1 cursor-move" />
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">
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
                          className="w-full px-3 py-2 border border-input rounded-md bg-background"
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
        </TabsContent>

        <TabsContent value="configuracoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>Configure detalhes de sua campanha</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
              Salvo
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

