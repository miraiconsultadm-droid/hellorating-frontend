import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, ExternalLink, X } from 'lucide-react';
import { api } from '@/lib/api';
import { niches, questionSuggestions } from '@/lib/questionSuggestions';

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('');
  const [googlePlaceId, setGooglePlaceId] = useState('');
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
    if (!campaignName.trim()) {
      alert('Por favor, insira um nome para a campanha');
      return;
    }

    // Gerar ID único para a campanha
    const campaignId = Math.random().toString(36).substring(2, 15);

    // Obter perguntas sugeridas baseadas no nicho
    const suggestedQuestions = selectedNiche && questionSuggestions[selectedNiche]
      ? questionSuggestions[selectedNiche].map((q, index) => ({
          ...q,
          id: Date.now() + index,
          order: index + 1,
        }))
      : [];

    const newCampaign = {
      id: campaignId,
      name: campaignName,
      mainMetric: 'NPS',
      redirectEnabled: !!googlePlaceId,
      redirectRule: 'promotores',
      feedbackEnabled: false,
      feedbackText: '',
      googlePlaceId: googlePlaceId || '',
      niche: selectedNiche || '',
      questions: suggestedQuestions,
    };

    // Salvar no localStorage (simulação)
    const existingCampaigns = JSON.parse(localStorage.getItem('campaigns') || '[]');
    existingCampaigns.push(newCampaign);
    localStorage.setItem('campaigns', JSON.stringify(existingCampaigns));

    // Atualizar estado
    setCampaigns([...campaigns, newCampaign]);

    // Limpar formulário e fechar modal
    setCampaignName('');
    setSelectedNiche('');
    setGooglePlaceId('');
    setShowModal(false);

    // Navegar para a campanha criada
    navigate(`/campanhas/${campaignId}`);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campanhas</h1>
          <p className="text-muted-foreground mt-1">Gerencie suas campanhas de pesquisa</p>
        </div>
        <Button 
          onClick={() => setShowModal(true)}
          className="gap-2 bg-green-500 hover:bg-green-600"
        >
          <Plus className="h-4 w-4" />
          Nova Campanha
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="hover:shadow-lg transition-shadow border border-gray-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{campaign.name}</CardTitle>
                  <CardDescription className="mt-1">ID: {campaign.id}</CardDescription>
                </div>
                <Link to={`/campanhas/${campaign.id}`}>
                  <Button variant="ghost" size="icon">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Métrica Principal</span>
                  <span className="font-semibold">{campaign.mainMetric || campaign.main_metric}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Redirecionamento</span>
                  <span className="font-semibold">{campaign.redirectEnabled || campaign.redirect_enabled ? 'Ativo' : 'Inativo'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Feedback</span>
                  <span className="font-semibold">{campaign.feedbackEnabled || campaign.feedback_enabled ? 'Ativo' : 'Inativo'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de Criação de Campanha */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Nova Campanha</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="campaign-name">Nome da Campanha *</Label>
                <Input
                  id="campaign-name"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="Ex: Pesquisa de Satisfação 2024"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="niche">Nicho da Empresa (Opcional)</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Selecione o nicho para receber sugestões de perguntas personalizadas
                </p>
                <select
                  id="niche"
                  value={selectedNiche}
                  onChange={(e) => setSelectedNiche(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md bg-white"
                >
                  <option value="">Selecione um nicho (opcional)</option>
                  {niches.map((niche) => (
                    <option key={niche.id} value={niche.id}>
                      {niche.name}
                    </option>
                  ))}
                </select>
                {selectedNiche && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ {questionSuggestions[selectedNiche]?.length || 0} perguntas serão sugeridas automaticamente
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="place-id">Google Place ID (Opcional)</Label>
                <p className="text-sm text-gray-500 mb-2">
                  Para redirecionar clientes para avaliar no Google, insira o Place ID da sua empresa.
                  <a 
                    href="https://developers.google.com/maps/documentation/places/web-service/place-id" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline ml-1"
                  >
                    Como encontrar meu Place ID?
                  </a>
                </p>
                <Input
                  id="place-id"
                  value={googlePlaceId}
                  onChange={(e) => setGooglePlaceId(e.target.value)}
                  placeholder="Ex: ChIJN1t_tDeuEmsRUsoyG83frY4"
                  className="w-full"
                />
                {googlePlaceId && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ Redirecionamento para Google será ativado automaticamente
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">💡 Dica: Como encontrar seu Google Place ID</h3>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Acesse <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="underline">Google Maps</a></li>
                  <li>Busque pelo nome da sua empresa</li>
                  <li>Clique no perfil da empresa</li>
                  <li>Copie a URL da barra de endereços</li>
                  <li>O Place ID está após "place/" ou "data=" na URL</li>
                </ol>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateCampaign}
                className="bg-green-500 hover:bg-green-600"
                disabled={!campaignName.trim()}
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

