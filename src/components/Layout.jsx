import { Link, useLocation, Outlet } from 'react-router-dom';
import { Home, FileText, Users, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

export default function Layout({ user }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [companyData, setCompanyData] = useState({
    name: '',
    placeId: '',
  });
  const [isCompanyRegistered, setIsCompanyRegistered] = useState(false);

  const navItems = [
    { path: '/resumo', label: 'Resumo', icon: Home },
    { path: '/clientes', label: 'Clientes', icon: Users },
    { path: '/campanhas', label: 'Campanhas', icon: FileText },
  ];

  const isActive = (path) => location.pathname === path;

  const handleRegisterCompany = () => {
    // Validar e registrar empresa
    if (companyData.name.trim() && companyData.placeId.trim()) {
      setIsCompanyRegistered(true);
      // Salvar no localStorage para persistir
      localStorage.setItem('company', JSON.stringify(companyData));
      setTimeout(() => {
        setShowCompanyModal(false);
      }, 1000);
    }
  };

  // Verificar se a empresa já está cadastrada ao carregar
  useState(() => {
    const savedCompany = localStorage.getItem('company');
    if (savedCompany) {
      setCompanyData(JSON.parse(savedCompany));
      setIsCompanyRegistered(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <img 
                  src="/logo.jpg" 
                  alt="HelloRating" 
                  className="h-8"
                />
              </div>
            </div>

            {/* Navigation - Desktop */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-red-50 text-red-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowCompanyModal(true)}
                className={`${
                  isCompanyRegistered
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-black hover:bg-gray-800'
                } text-white`}
              >
                {isCompanyRegistered ? '✓ Empresa Cadastrada' : 'Cadastrar Empresa'}
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">5.000 créditos</span>
              </div>
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                D
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}>
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <img src="/logo.jpg" alt="HelloRating" className="h-8 mb-6" />
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                        isActive(item.path)
                          ? 'bg-red-50 text-red-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cadastro de Empresa */}
      {showCompanyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              {isCompanyRegistered ? 'Dados da Empresa' : 'Cadastrar Empresa'}
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              {isCompanyRegistered
                ? 'Você já cadastrou sua empresa. Você pode atualizar os dados abaixo.'
                : 'Cadastre sua empresa uma única vez para usar em todas as campanhas.'}
            </p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName">Nome da Empresa</Label>
                <Input
                  id="companyName"
                  placeholder="Ex: Restaurante Sabor & Arte"
                  value={companyData.name}
                  onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="placeId">Google Place ID</Label>
                <Input
                  id="placeId"
                  placeholder="Ex: ChIJN1t_tDeuEmsRUsoyG83frY4"
                  value={companyData.placeId}
                  onChange={(e) => setCompanyData({ ...companyData, placeId: e.target.value })}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  <a
                    href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Como encontrar o Place ID?
                  </a>
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Dica:</strong> O Place ID é usado para redirecionar clientes satisfeitos para
                  deixarem avaliações no Google. Você só precisa cadastrar uma vez!
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCompanyModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleRegisterCompany}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                disabled={!companyData.name.trim() || !companyData.placeId.trim()}
              >
                {isCompanyRegistered ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}

