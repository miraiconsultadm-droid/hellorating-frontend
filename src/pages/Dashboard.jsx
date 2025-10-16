import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Star, TrendingUp, MessageSquare, Send } from 'lucide-react';
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
        <p className="text-muted-foreground">Nenhum dado disponível</p>
      </div>
    );
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Promotor':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Passivo':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Detrator':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Survey Test</h1>
        <p className="text-muted-foreground mt-1">Resumo da campanha</p>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nota NPS</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.nps.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="inline-block px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                Atenção
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa Respostas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.responseRate}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Respostas</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.responses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Envios</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.sends}</div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimos 10 dias */}
        <Card>
          <CardHeader>
            <CardTitle>Últimos 10 dias</CardTitle>
            <CardDescription>Quantidade de respostas recebidas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.last10Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Últimas Respostas */}
        <Card>
          <CardHeader>
            <CardTitle>Últimas Respostas</CardTitle>
            <CardDescription>Últimas respostas da campanha</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.latestResponses.map((response) => (
                <div key={response.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-sm font-semibold">
                      {response.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{response.name}</p>
                      <p className="text-xs text-muted-foreground">{response.email}</p>
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

        {/* Porcentagem NPS */}
        <Card>
          <CardHeader>
            <CardTitle>Porcentagem NPS</CardTitle>
            <CardDescription>Porcentagem de avaliações</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.npsPercentage}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="category" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]}>
                  {dashboardData.npsPercentage.map((entry, index) => (
                    <Bar key={`cell-${index}`} dataKey="value" fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Notas NPS */}
        <Card>
          <CardHeader>
            <CardTitle>Notas NPS</CardTitle>
            <CardDescription>Quantidade de avaliações por nota</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
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
                    return <Bar key={`cell-${index}`} dataKey="count" fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Avaliação de Estrelas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Estrelas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-2xl font-bold">Como você avalia o atendimento da Netkings?</p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className={`w-8 h-8 ${star <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <p className="text-3xl font-bold">5.00</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

