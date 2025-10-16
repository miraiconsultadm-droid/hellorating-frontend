import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Phone, Mail, Eye, X, Calendar, FileText } from 'lucide-react';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientResponses, setClientResponses] = useState([]);

  useEffect(() => {
    // Carregar respostas do localStorage
    const responses = JSON.parse(localStorage.getItem('responses') || '[]');
    
    // Extrair clientes únicos das respostas
    const clientsMap = new Map();
    
    responses.forEach((response) => {
      const key = response.customerPhone; // Usar telefone como chave única
      
      if (!clientsMap.has(key)) {
        clientsMap.set(key, {
          id: key,
          name: response.customerName,
          phone: response.customerPhone,
          email: response.customerEmail || '-',
          responses: 1,
          lastResponse: response.submittedAt,
        });
      } else {
        const client = clientsMap.get(key);
        client.responses += 1;
        // Atualizar com a resposta mais recente
        if (new Date(response.submittedAt) > new Date(client.lastResponse)) {
          client.lastResponse = response.submittedAt;
        }
      }
    });
    
    // Converter Map para Array e ordenar por data da última resposta
    const clientsArray = Array.from(clientsMap.values()).sort(
      (a, b) => new Date(b.lastResponse) - new Date(a.lastResponse)
    );
    
    setClients(clientsArray);
    setLoading(false);
  }, []);

  const handleViewResponses = (client) => {
    setSelectedClient(client);
    
    // Buscar todas as respostas deste cliente
    const responses = JSON.parse(localStorage.getItem('responses') || '[]');
    const clientResponses = responses.filter(
      (response) => response.customerPhone === client.phone
    );
    
    setClientResponses(clientResponses);
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getNPSCategory = (score) => {
    if (score >= 9) return { label: 'Promotor', color: 'text-green-600 bg-green-50' };
    if (score >= 7) return { label: 'Passivo', color: 'text-yellow-600 bg-yellow-50' };
    return { label: 'Detrator', color: 'text-red-600 bg-red-50' };
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
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground mt-1">Respondentes das pesquisas de satisfação</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, telefone ou e-mail..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>
            {filteredClients.length} cliente{filteredClients.length !== 1 ? 's' : ''} encontrado{filteredClients.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Nenhum cliente encontrado</p>
              <p className="text-sm text-muted-foreground mt-2">
                Os clientes aparecerão aqui após responderem às pesquisas
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100 cursor-pointer"
                  onClick={() => handleViewResponses(client)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-lg font-semibold text-white">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-lg">{client.name}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {client.phone}
                        </div>
                        {client.email && client.email !== '-' && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {client.email}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Última resposta: {formatDate(client.lastResponse)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Respostas</p>
                      <p className="font-semibold text-2xl text-green-600">{client.responses}</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="h-4 w-4" />
                      Ver Respostas
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Visualização de Respostas */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-2xl font-semibold text-white">
                  {selectedClient.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedClient.name}</h2>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {selectedClient.phone}
                    </div>
                    {selectedClient.email && selectedClient.email !== '-' && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {selectedClient.email}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedClient(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Histórico de Respostas ({clientResponses.length})
              </h3>

              {clientResponses.map((response, index) => {
                // Encontrar a pergunta NPS para exibir a categoria
                const npsAnswer = response.answers.find(
                  (answer) => answer.type === 'NPS' || answer.type === 'nps'
                );
                const npsScore = npsAnswer ? parseInt(npsAnswer.value) : null;
                const npsCategory = npsScore !== null ? getNPSCategory(npsScore) : null;

                return (
                  <Card key={index} className="border border-gray-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {formatDate(response.submittedAt)}
                          </span>
                        </div>
                        {npsCategory && (
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${npsCategory.color}`}>
                            {npsCategory.label} ({npsScore})
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Campanha: {response.campaignId}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {response.answers.map((answer, answerIndex) => (
                          <div key={answerIndex} className="border-l-2 border-gray-200 pl-4">
                            <p className="text-sm font-medium text-gray-700">
                              {answer.question}
                            </p>
                            <p className="text-base font-semibold text-gray-900 mt-1">
                              {answer.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setSelectedClient(null)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

