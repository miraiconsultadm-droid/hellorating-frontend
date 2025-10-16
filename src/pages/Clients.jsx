import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search, X } from 'lucide-react';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  useEffect(() => {
    // Carregar clientes do localStorage
    const savedClients = JSON.parse(localStorage.getItem('clients') || '[]');
    
    // Se não houver clientes salvos, usar mock data
    if (savedClients.length === 0) {
      const mockClients = [
        { id: 1, name: 'John Doe', email: 'john@doe.com', responses: 5 },
        { id: 2, name: 'Jane Smith', email: 'jane@smith.com', responses: 3 },
        { id: 3, name: 'Bob Johnson', email: 'bob@johnson.com', responses: 7 },
        { id: 4, name: 'Alice Williams', email: 'alice@williams.com', responses: 2 },
        { id: 5, name: 'Charlie Brown', email: 'charlie@brown.com', responses: 4 },
      ];
      setClients(mockClients);
      localStorage.setItem('clients', JSON.stringify(mockClients));
    } else {
      setClients(savedClients);
    }
    
    setLoading(false);
  }, []);

  const handleCreateClient = () => {
    if (!clientName.trim() || !clientEmail.trim()) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientEmail)) {
      alert('Por favor, insira um e-mail válido');
      return;
    }

    const newClient = {
      id: Date.now(),
      name: clientName,
      email: clientEmail,
      responses: 0,
    };

    const updatedClients = [...clients, newClient];
    setClients(updatedClients);
    localStorage.setItem('clients', JSON.stringify(updatedClients));

    // Limpar formulário e fechar modal
    setClientName('');
    setClientEmail('');
    setShowModal(false);
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <p className="text-muted-foreground mt-1">Gerencie seus clientes e participantes</p>
        </div>
        <Button 
          onClick={() => setShowModal(true)}
          className="gap-2 bg-green-500 hover:bg-green-600"
        >
          <Plus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar clientes..."
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
          <div className="space-y-3">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-lg font-semibold">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-muted-foreground">{client.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Respostas</p>
                  <p className="font-semibold">{client.responses}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Criação de Cliente */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Novo Cliente</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client-name">Nome *</Label>
                <Input
                  id="client-name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Nome completo do cliente"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client-email">E-mail *</Label>
                <Input
                  id="client-email"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className="w-full"
                />
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
                onClick={handleCreateClient}
                className="bg-green-500 hover:bg-green-600"
                disabled={!clientName.trim() || !clientEmail.trim()}
              >
                Criar Cliente
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

