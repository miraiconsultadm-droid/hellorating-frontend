import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { api } from '@/lib/api';

export default function Survey() {
  const { surveyId } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(-1); // -1 = tela de dados do cliente
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const data = await api.getSurvey(surveyId);
        setCampaign(data.campaign);
      } catch (error) {
        console.error('Error fetching survey:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [surveyId]);

  const handleAnswer = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleStartSurvey = () => {
    if (customerName.trim() && customerPhone.trim()) {
      setCurrentQuestion(0);
    }
  };

  const handleNext = () => {
    if (currentQuestion < campaign.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const calculateNPSCategory = (score) => {
    if (score >= 9) return 'promotor';
    if (score >= 7) return 'passivo';
    return 'detrator';
  };

  const handleSubmit = async () => {
    try {
      // Salvar resposta
      const response = {
        campaignId: campaign.id,
        customerName,
        customerPhone,
        answers,
        submittedAt: new Date().toISOString(),
      };

      await api.submitResponse(response);

      setSubmitted(true);

      // Verificar se deve redirecionar para o Google
      if (campaign.redirectEnabled) {
        const mainQuestion = campaign.questions.find(q => q.isMain);
        if (mainQuestion) {
          const npsScore = answers[mainQuestion.id];
          const category = calculateNPSCategory(npsScore);

          const shouldRedirect =
            campaign.redirectRule === 'todos' ||
            (campaign.redirectRule === 'promotores' && category === 'promotor') ||
            (campaign.redirectRule === 'passivos' && category === 'passivo') ||
            (campaign.redirectRule === 'detratores' && category === 'detrator');

          if (shouldRedirect) {
            // Buscar o Place ID da empresa cadastrada
            const company = JSON.parse(localStorage.getItem('company') || '{}');
            const placeId = company.placeId || campaign.googlePlaceId;

            if (placeId) {
              setTimeout(() => {
                window.location.href = `https://search.google.com/local/writereview?placeid=${placeId}`;
              }, 2000);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error submitting response:', error);
    }
  };

  const renderQuestion = (question) => {
    const answer = answers[question.id];

    switch (question.type) {
      case 'NPS':
        return (
          <div className="space-y-4">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Muito improvável</span>
              <span>Muito provável</span>
            </div>
            <div className="grid grid-cols-11 gap-2">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                <button
                  key={score}
                  onClick={() => handleAnswer(question.id, score)}
                  className={`h-12 rounded-lg font-semibold transition-all ${
                    answer === score
                      ? score <= 6
                        ? 'bg-red-500 text-white'
                        : score <= 8
                        ? 'bg-yellow-500 text-white'
                        : 'bg-green-500 text-white'
                      : score <= 6
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : score <= 8
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>
        );

      case 'Estrelas':
        return (
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleAnswer(question.id, star)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-12 h-12 ${
                    answer >= star
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        );

      case 'Emoção':
        const emotions = [
          { value: 1, emoji: '😠', label: 'Muito insatisfeito' },
          { value: 2, emoji: '😐', label: 'Neutro' },
          { value: 3, emoji: '😊', label: 'Satisfeito' },
        ];
        return (
          <div className="flex justify-center gap-4">
            {emotions.map((emotion) => (
              <button
                key={emotion.value}
                onClick={() => handleAnswer(question.id, emotion.value)}
                className={`flex flex-col items-center p-4 rounded-lg transition-all ${
                  answer === emotion.value
                    ? 'bg-green-100 ring-2 ring-green-500'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <span className="text-5xl mb-2">{emotion.emoji}</span>
                <span className="text-sm text-gray-700">{emotion.label}</span>
              </button>
            ))}
          </div>
        );

      case 'Escala de Emoção':
        const emotionScale = [
          { value: 1, emoji: '😠', label: 'Muito insatisfeito' },
          { value: 2, emoji: '😕', label: 'Insatisfeito' },
          { value: 3, emoji: '😐', label: 'Neutro' },
          { value: 4, emoji: '😊', label: 'Satisfeito' },
          { value: 5, emoji: '😍', label: 'Muito satisfeito' },
        ];
        return (
          <div className="flex justify-center gap-3">
            {emotionScale.map((emotion) => (
              <button
                key={emotion.value}
                onClick={() => handleAnswer(question.id, emotion.value)}
                className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                  answer === emotion.value
                    ? 'bg-green-100 ring-2 ring-green-500'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <span className="text-4xl mb-1">{emotion.emoji}</span>
                <span className="text-xs text-gray-700">{emotion.label}</span>
              </button>
            ))}
          </div>
        );

      case 'Curtir / Não Curtir':
        return (
          <div className="flex justify-center gap-8">
            <button
              onClick={() => handleAnswer(question.id, 'like')}
              className={`flex flex-col items-center p-6 rounded-lg transition-all ${
                answer === 'like'
                  ? 'bg-green-100 ring-2 ring-green-500'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <ThumbsUp className="w-16 h-16 text-green-600" />
              <span className="mt-2 text-sm font-medium">Curtir</span>
            </button>
            <button
              onClick={() => handleAnswer(question.id, 'dislike')}
              className={`flex flex-col items-center p-6 rounded-lg transition-all ${
                answer === 'dislike'
                  ? 'bg-red-100 ring-2 ring-red-500'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <ThumbsDown className="w-16 h-16 text-red-600" />
              <span className="mt-2 text-sm font-medium">Não Curtir</span>
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Carregando pesquisa...</div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Pesquisa não encontrada</div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="mb-4 text-6xl">✓</div>
            <h2 className="text-2xl font-bold mb-2">Obrigado!</h2>
            <p className="text-gray-600">
              {campaign.feedbackEnabled && campaign.feedbackText
                ? campaign.feedbackText
                : 'Sua resposta foi enviada com sucesso.'}
            </p>
            {campaign.redirectEnabled && (
              <p className="text-sm text-gray-500 mt-4">
                Redirecionando para o Google em alguns segundos...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Tela de dados do cliente
  if (currentQuestion === -1) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold mb-2 text-center">
              Olá, obrigado por ser nosso cliente!
            </h1>
            <p className="text-gray-600 text-center mb-6">
              Gostaríamos de aperfeiçoar a sua experiência com os nossos serviços
              através deste questionário que dura apenas 60 segundos.
            </p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="customerName">Nome Completo *</Label>
                <Input
                  id="customerName"
                  type="text"
                  placeholder="Digite seu nome completo"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="customerPhone">Telefone *</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="mt-1"
                />
              </div>

              <Button
                onClick={handleStartSurvey}
                disabled={!customerName.trim() || !customerPhone.trim()}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Iniciar Pesquisa
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = campaign.questions[currentQuestion];
  const answer = answers[question.id];
  const isLastQuestion = currentQuestion === campaign.questions.length - 1;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="pt-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">
                Pergunta {currentQuestion + 1} de {campaign.questions.length}
              </span>
              <span className="text-sm font-medium text-green-600">
                {Math.round(((currentQuestion + 1) / campaign.questions.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{
                  width: `${((currentQuestion + 1) / campaign.questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-6 text-center">
            {question.text}
          </h2>

          <div className="mb-8">{renderQuestion(question)}</div>

          <div className="flex justify-end">
            <Button
              onClick={handleNext}
              disabled={answer === undefined}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
            >
              {isLastQuestion ? 'Enviar' : 'Próxima'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

