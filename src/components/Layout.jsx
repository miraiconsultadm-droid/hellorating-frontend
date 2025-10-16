import { Link, useLocation, Outlet } from 'react-router-dom';
import { Home, FileText, Users, Menu, CheckCircle2, MapPin, Building2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';

export default function Layout({ user }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [companyData, setCompanyData] = useState({
    name: '',
    placeId: '',
  });
  const [isCompanyRegistered, setIsCompanyRegistered] = useState(false);
  const [placeIdValid, setPlaceIdValid] = useState(false);
  const [validating, setValidating] = useState(false);

  const navItems = [
    { path: '/resumo', label: 'Resumo', icon: Home },
    { path: '/clientes', label: 'Clientes', icon: Users },
    { path: '/campanhas', label: 'Campanhas', icon: FileText },
  ];

  const isActive = (path) => location.pathname === path;

  // Verificar se a empresa já está cadastrada ao carregar
  useEffect(() => {
    const savedCompany = localStorage.getItem('company');
    if (savedCompany) {
      try {
        const company = JSON.parse(savedCompany);
        setCompanyData(company);
        setIsCompanyRegistered(true);
        setPlaceIdValid(true);
      } catch (error) {
        console.error('Error loading company data:', error);
      }
    }
  }, []);

  // Validar Place ID em tempo real
  useEffect(() => {
    const validatePlaceId = () => {
      const placeId = companyData.placeId.trim();
      
      if (!placeId) {
        setPlaceIdValid(false);
        return;
      }

      // Validar formato do Place ID
      const isValid = placeId.length > 10 && /^[A-Za-z0-9_-]+$/.test(placeId);
      setPlaceIdValid(isValid);
    };

    // Debounce validation
    const timeoutId = setTimeout(validatePlaceId, 500);
    return () => clearTimeout(timeoutId);
  }, [companyData.placeId]);

  const handleRegisterCompany = () => {
    // Validar e registrar empresa
    if (companyData.name.trim() && companyData.placeId.trim() && placeIdValid) {
      setIsCompanyRegistered(true);
      // Salvar no localStorage para persistir
      localStorage.setItem('company', JSON.stringify(companyData));
      alert('Empresa cadastrada com sucesso!');
      setTimeout(() => {
        setShowCompanyModal(false);
      }, 500);
    } else {
      alert('Por favor, preencha todos os campos corretamente.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-md"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/resumo" className="flex items-center gap-2">
              <img src="/logo.jpg" alt="HelloRating" className="h-8" />
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowCompanyModal(true)}
              className={`gap-2 ${
                isCompanyRegistered
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isCompanyRegistered ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Empresa Cadastrada
                </>
              ) : (
                <>
                  <Building2 className="h-4 w-4" />
                  Cadastrar Empresa
                </>
              )}
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                {user?.name?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:block w-64 border-r border-gray-200 min-h-[calc(100vh-57px)] bg-white">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-green-50 text-green-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>

      {/* Sidebar Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden" onClick={() => setSidebarOpen(false)}>
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
                          ? 'bg-green-50 text-green-600'
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

      {/* Modal de Cadastro de Empresa - Didático */}
      {showCompanyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-2">
              {isCompanyRegistered ? '✓ Empresa Conectada' : 'Conectar Empresa ao Google'}
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              {isCompanyRegistered
                ? 'Sua empresa está conectada ao Google. Você pode atualizar os dados abaixo se necessário.'
                : 'Conecte sua empresa ao Google para redirecionar clientes satisfeitos para deixarem avaliações.'}
            </p>

            {/* Passo a Passo Didático */}
            {!isCompanyRegistered && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Como encontrar o Place ID da sua empresa:
                </h3>
                <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                  <li>
                    Acesse o{' '}
                    <a
                      href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline inline-flex items-center gap-1"
                    >
                      Google Place ID Finder
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>Digite o nome da sua empresa na busca</li>
                  <li>Selecione sua empresa nos resultados</li>
                  <li>Copie o <strong>Place ID</strong> que aparece (formato: ChIJ...)</li>
                  <li>Cole o Place ID no campo abaixo</li>
                </ol>
              </div>
            )}

            {/* Formulário */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName" className="text-base font-semibold">
                  Nome da Empresa *
                </Label>
                <Input
                  id="companyName"
                  placeholder="Ex: Restaurante Sabor & Arte"
                  value={companyData.name}
                  onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                  className="mt-2 text-base"
                />
              </div>

              <div>
                <Label htmlFor="placeId" className="text-base font-semibold">
                  Google Place ID *
                </Label>
                <div className="relative">
                  <Input
                    id="placeId"
                    placeholder="Ex: ChIJN1t_tDeuEmsRUsoyG83frY4"
                    value={companyData.placeId}
                    onChange={(e) => setCompanyData({ ...companyData, placeId: e.target.value })}
                    className={`mt-2 text-base pr-10 ${
                      companyData.placeId && (placeIdValid ? 'border-green-500' : 'border-red-500')
                    }`}
                  />
                  {companyData.placeId && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {placeIdValid ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <span className="text-red-500 text-xl">✗</span>
                      )}
                    </div>
                  )}
                </div>
                {companyData.placeId && !placeIdValid && (
                  <p className="text-xs text-red-600 mt-1">
                    Place ID inválido. Deve ter mais de 10 caracteres e conter apenas letras, números, hífens e underscores.
                  </p>
                )}
                {companyData.placeId && placeIdValid && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Place ID válido!
                  </p>
                )}
              </div>

              {/* Preview da Conexão */}
              {isCompanyRegistered && companyData.name && companyData.placeId && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Empresa Conectada:
                  </h3>
                  <div className="text-sm text-green-800 space-y-1">
                    <p><strong>Nome:</strong> {companyData.name}</p>
                    <p><strong>Place ID:</strong> {companyData.placeId}</p>
                    <a
                      href={`https://search.google.com/local/writereview?placeid=${companyData.placeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:underline inline-flex items-center gap-1 mt-2"
                    >
                      Testar link de avaliação do Google
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Botões */}
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCompanyModal(false)}
                className="flex-1"
              >
                {isCompanyRegistered ? 'Fechar' : 'Cancelar'}
              </Button>
              <Button
                onClick={handleRegisterCompany}
                className="flex-1 bg-green-500 hover:bg-green-600"
                disabled={!companyData.name.trim() || !companyData.placeId.trim() || !placeIdValid}
              >
                {isCompanyRegistered ? 'Atualizar Dados' : 'Conectar Empresa'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

