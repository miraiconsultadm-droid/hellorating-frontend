import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Eye, AlertCircle, Mail } from 'lucide-react';
import { api } from '@/lib/api';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscar dados do dashboard da primeira campanha
    const fetchDashboard = async () => {
      try {
        const campaigns = await api.getCampaigns();
        if (campaigns.length > 0) {
          const data = await api.getDashboardData(campaigns[0].id);
          setDashboardData(data);
        }
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Nenhum dado disponível</p>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold">Campanha teste</h1>
      </div>

      {/* Abas */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          <button className="pb-3 border-b-2 border-green-500 font-medium text-sm">
            Resumo
          </button>
          <button className="pb-3 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700">
            Participantes
          </button>
          <button className="pb-3 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700">
            Perguntas
          </button>
          <button className="pb-3 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700">
            Configurações
          </button>
        </nav>
      </div>

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
  );
}

