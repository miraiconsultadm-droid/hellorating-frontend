import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, FileText, Users, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

export default function Layout({ user }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const navItems = [
    { path: '/resumo', label: 'Resumo', icon: Home },
    { path: '/clientes', label: 'Clientes', icon: Users },
    { path: '/campanhas', label: 'Campanhas', icon: FileText },
  ];

  const isActive = (path) => location.pathname === path;

  const handleConnectGoogle = () => {
    // Simular conexão com Google
    if (companyName.trim()) {
      setIsConnected(true);
      setTimeout(() => {
        setShowGoogleModal(false);
        setCompanyName('');
      }, 1000);
    }
  };

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
                <img src="/logo.jpg" alt="HelloRating" className="h-8" />
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive(item.path) ? 'secondary' : 'ghost'}
                      className="gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>

            {/* User Info */}
            <div className="flex items-center gap-4">
              {!isConnected && (
                <Button 
                  onClick={() => setShowGoogleModal(true)}
                  className="bg-black hover:bg-gray-800 text-white text-sm px-4 py-2"
                >
                  Conectar Google
                </Button>
              )}
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10" fill="#10b981"/>
                </svg>
                <span className="font-medium">5.000 créditos</span>
              </div>
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold">D</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}>
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-6">
                <img src="/logo.jpg" alt="HelloRating" className="h-8" />
              </div>
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}>
                      <Button
                        variant={isActive(item.path) ? 'secondary' : 'ghost'}
                        className="w-full justify-start gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Modal Conectar Google */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setShowGoogleModal(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setShowGoogleModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
            
            <h2 className="text-xl font-bold mb-2">Conectar Google</h2>
            <p className="text-sm text-gray-500 mb-6">Conecte sua conta do Google para importar dados</p>
            
            {isConnected ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </div>
                  <p className="text-green-600 font-medium">Conectado com sucesso!</p>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Nome da empresa</Label>
                    <Input
                      id="company-name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Digite o nome da sua empresa"
                      className="w-full"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handleConnectGoogle}
                  disabled={!companyName.trim()}
                  className="w-full bg-gray-800 hover:bg-gray-900 text-white"
                >
                  Conectar
                </Button>
              </>
            )}
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

