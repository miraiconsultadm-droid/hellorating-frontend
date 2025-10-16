import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Plus, ExternalLink, X } from 'lucide-react';
import { api } from '@/lib/api';
import { niches, questionSuggestions } from '@/lib/questionSuggestions';

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [campaignData, setCampaignData] = useState({
    name: '',
    niche: '',
    mainMetric: 'NPS',
    redirectEnabled: false,
    redirectRule: 'promotores',
    feedbackEnabled: false,
    feedbackText: 'Obrigado pelo seu feedback! Sua opinião é muito importante para nós.',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const data = await api.getCampaigns();
        setCampaigns(data);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const handleCreateCampaign = async () => {
    if (!campaignData.name.trim()) {
      alert('Por favor, insira um nome para a campanha');
      return;
    }

    // Verificar se a empresa está cadastrada
    const company = JSON.parse(localStorage.getItem('company') || '{}');
    if (!company.name || !company.placeId) {
      alert('Por favor, cadastre sua empresa antes de criar uma campanha. Clique em "Cadastrar Empresa" no cabeçalho.');
      return;
    }

    // Gerar ID único para a campanha
    const campaignId = Math.random().toString(36).substring(2, 15);

    // Obter perguntas sugeridas baseadas no nicho
    const suggestedQuestions = campaignData.niche && questionSuggestions[campaignData.niche]
      ? questionSuggestions[campaignData.niche].map((q, index) => ({
          ...q,
          id: Date.now() + index,
          order: index + 1,
        }))
      : [];

    const newCampaign = {
      id: campaignId,
      ...campaignData,
      googlePlaceId: company.placeId,
      questions: suggestedQuestions,
    };

    // Salvar no localStorage (simulação)
    const existingCampaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
    existingCampaigns.push(newCampaign);
    localStorage.setItem('campaigns', JSON.stringify(existingCampaigns));

    // Atualizar estado
    setCampaigns([...campaigns, newCampaign]);

    // Limpar formulário e fechar modal
    setCampaignData({
      name: '',
      niche: '',
      mainMetric: 'NPS',
      redirectEnabled: false,
      redirectRule: 'promotores',
      feedbackEnabled: false,
      feedbackText: 'Obrigado pelo seu feedback! Sua opinião é muito importante para nós.',
    });
    setShowModal(false);

    // Navegar para a campanha criada
    navigate(`/campanhas/${campaignId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando campanhas...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campanhas</h1>
          <p className="text-gray-600 mt-1">Gerencie suas campanhas de pesquisa</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-green-600 hover:bg-green-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nova Campanha
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{campaign.name}</CardTitle>
                  <CardDescription className="text-sm mt-1">
                    ID: {campaign.id}
                  </CardDescription>
                </div>
                <Link to={`/campanhas/${campaign.id}`}>
                  <Button size="icon" variant="ghost" className="text-red-600">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Métrica Principal</span>
                  <span className="font-medium">{campaign.mainMetric || 'NPS'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Redirecionamento</span>
                  <span className={campaign.redirectEnabled ? 'text-green-600' : 'text-gray-400'}>
                    {campaign.redirectEnabled ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Feedback</span>
                  <span className={campaign.feedbackEnabled ? 'text-green-600' : 'text-gray-400'}>
                    {campaign.feedbackEnabled ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {campaigns.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-gray-500 mb-4">Nenhuma campanha criada ainda</p>
            <Button onClick={() => setShowModal(true)} className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Campanha
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal de Criação de Campanha */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 my-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Nova Campanha</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowModal(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {/* Nome da Campanha */}
              <div>
                <Label htmlFor="campaignName">Nome da Campanha *</Label>
                <Input
                  id="campaignName"
                  placeholder="Ex: Pesquisa de Satisfação 2025"
                  value={campaignData.name}
                  onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
                  className="mt-1"
                />
              </div>

              {/* Nicho */}
              <div>
                <Label htmlFor="niche">Nicho da Empresa</Label>
                <select
                  id="niche"
                  value={campaignData.niche}
                  onChange={(e) => setCampaignData({ ...campaignData, niche: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background mt-1"
                >
                  <option value="">Selecione um nicho (opcional)</option>
                  {niches.map((niche) => (
                    <option key={niche.id} value={niche.id}>
                      {niche.name}
                    </option>
                  ))}
                </select>
                {campaignData.niche && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ {questionSuggestions[campaignData.niche]?.length || 0} perguntas serão sugeridas automaticamente
                  </p>
                )}
              </div>

              {/* Métrica Principal */}
              <div>
                <Label htmlFor="mainMetric">Métrica Principal</Label>
                <select
                  id="mainMetric"
                  value={campaignData.mainMetric}
                  onChange={(e) => setCampaignData({ ...campaignData, mainMetric: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background mt-1"
                >
                  <option value="NPS">NPS (Net Promoter Score)</option>
                  <option value="CSAT">CSAT (Customer Satisfaction)</option>
                  <option value="CES">CES (Customer Effort Score)</option>
                </select>
              </div>

              {/* Redirecionamento para Google */}
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
                    checked={campaignData.redirectEnabled}
                    onCheckedChange={(checked) =>
                      setCampaignData({ ...campaignData, redirectEnabled: checked })
                    }
                  />
                </div>

                {campaignData.redirectEnabled && (
                  <div>
                    <Label htmlFor="redirectRule">Quem deve ser redirecionado?</Label>
                    <select
                      id="redirectRule"
                      value={campaignData.redirectRule}
                      onChange={(e) => setCampaignData({ ...campaignData, redirectRule: e.target.value })}
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

              {/* Mensagem de Feedback */}
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
                    checked={campaignData.feedbackEnabled}
                    onCheckedChange={(checked) =>
                      setCampaignData({ ...campaignData, feedbackEnabled: checked })
                    }
                  />
                </div>

                {campaignData.feedbackEnabled && (
                  <div>
                    <Label htmlFor="feedbackText">Texto da Mensagem</Label>
                    <Textarea
                      id="feedbackText"
                      placeholder="Digite a mensagem que será exibida ao cliente"
                      value={campaignData.feedbackText}
                      onChange={(e) => setCampaignData({ ...campaignData, feedbackText: e.target.value })}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateCampaign}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                disabled={!campaignData.name.trim()}
              >
                Criar Campanha
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

