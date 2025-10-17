import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Eye, AlertCircle, Mail } from 'lucide-react';
import { api } from '@/lib/api';
import { calculateDashboardMetrics } from '@/lib/dashboardMetrics';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscar dados do dashboard geral (todas as campanhas)
    const fetchDashboard = async () => {
      try {
        const [campaigns, responses] = await Promise.all([
          api.getCampaigns(),
          api.getResponses()
        ]);
        
        // Calcular métricas agregadas de todas as campanhas
        const metrics = calculateDashboardMetrics(responses, campaigns);
        setDashboardData(metrics);
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

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

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-gray-600">Carregando dashboard...</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-8">
        <div className="text-gray-600">Nenhum dado disponível</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard Geral</h1>
        <p className="text-gray-600">Visão geral de todas as campanhas</p>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nota NPS</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboardData.nps}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {dashboardData.nps >= 50 ? 'Excelente' : dashboardData.nps >= 0 ? 'Bom' : 'Precisa melhorar'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Respostas</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboardData.responseRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {dashboardData.latestResponses.length} respostas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Abertura</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboardData.openRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Emails abertos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Erro</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboardData.errorRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Emails com erro</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
	        {/* Gráfico de Rosca - Porcentagem NPS */}
	        <Card>
	          <CardHeader>
	            <CardTitle>Porcentagem NPS</CardTitle>
	            <CardDescription>Distribuição de Promotores, Passivos e Detratores</CardDescription>
	          </CardHeader>
		          <CardContent>
		            {dashboardData.npsPercentage && dashboardData.npsPercentage.some(p => parseFloat(p.value) > 0) ? (
		              <ResponsiveContainer width="100%" height={300}>
		                <PieChart>
		                  <Pie
		                    data={dashboardData.npsPercentage.filter(p => parseFloat(p.value) > 0)}
		                    cx="50%"
		                    cy="50%"
		                    innerRadius={60}
		                    outerRadius={100}
		                    fill="#8884d8"
		                    paddingAngle={5}
		                    dataKey="value"
		                    labelLine={false}
		                    label={(entry) => `${entry.category}: ${entry.value}%`}
		                  >
		                    {dashboardData.npsPercentage.filter(p => parseFloat(p.value) > 0).map((entry, index) => (
		                      <Cell key={`cell-${index}`} fill={entry.color} />
		                    ))}
		                  </Pie>
		                  <Tooltip />
		                </PieChart>
		              </ResponsiveContainer>
		            ) : (
		              <div className="flex items-center justify-center h-[300px]">
		                <p className="text-gray-500">Sem dados de NPS para exibir.</p>
		              </div>
		            )}
		          </CardContent>
	        </Card>

        {/* Gráfico de Barras - Notas NPS */}
        <Card>
          <CardHeader>
            <CardTitle>Notas NPS</CardTitle>
            <CardDescription>Distribuição de notas de 0 a 10</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.npsScores}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="score" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Últimas Respostas */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas Respostas</CardTitle>
          <CardDescription>Respostas mais recentes de todas as campanhas</CardDescription>
        </CardHeader>
        <CardContent>
          {dashboardData.latestResponses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma resposta ainda. Compartilhe o link da pesquisa com seus clientes!
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData.latestResponses.map((response) => (
                <div
                  key={response.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-700 font-semibold">
                        {response.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{response.name}</div>
                      <div className="text-sm text-gray-500">{response.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">{response.date}</div>
                      <div className="text-sm font-medium">Nota: {response.score}</div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(
                        response.category
                      )}`}
                    >
                      {response.category}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

