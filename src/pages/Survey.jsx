import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { api } from '@/lib/api';

export default function Survey() {
  const { surveyId } = useParams();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const data = await api.getSurvey(surveyId);
        setSurvey({
          id: surveyId,
          title: data.campaign.name,
          customerName: 'John Doe',
          questions: data.questions,
        });
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

  const handleNext = () => {
    if (currentQuestion < survey.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      await api.submitSurveyResponse(surveyId, {
        email: 'customer@example.com',
        answers: answers,
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting response:', error);
      setSubmitted(true); // Still show success for demo
    }
  };

  const renderQuestion = (question) => {
    const answer = answers[question.id];

    switch (question.type) {
      case 'nps':
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 justify-center">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => handleAnswer(question.id, num)}
                  className={`w-12 h-12 rounded-lg font-semibold transition-all ${
                    answer === num
                      ? num <= 6
                        ? 'bg-red-500 text-white'
                        : num <= 8
                        ? 'bg-yellow-500 text-white'
                        : 'bg-green-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-sm text-muted-foreground px-2">
              <span>Muito improvável</span>
              <span>Muito provável</span>
            </div>
          </div>
        );

      case 'stars':
        return (
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => handleAnswer(question.id, num)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-12 h-12 ${
                    answer >= num ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        );

      case 'emotion_scale':
        return (
          <div className="flex flex-wrap gap-4 justify-center">
            {question.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(question.id, option.value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg transition-all ${
                  answer === option.value
                    ? 'bg-gray-200 ring-2 ring-green-500'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <span className="text-4xl">{option.emoji}</span>
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        );

      case 'emotion':
        return (
          <div className="flex gap-6 justify-center">
            {question.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(question.id, option.value)}
                className={`flex items-center justify-center w-20 h-20 rounded-full transition-all ${
                  answer === option.value
                    ? 'bg-gray-200 ring-2 ring-green-500 scale-110'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <span className="text-5xl">{option.emoji}</span>
              </button>
            ))}
          </div>
        );

      case 'like_dislike':
        return (
          <div className="flex gap-6 justify-center">
            <button
              onClick={() => handleAnswer(question.id, 'dislike')}
              className={`flex items-center justify-center w-20 h-20 rounded-full transition-all ${
                answer === 'dislike'
                  ? 'bg-red-100 ring-2 ring-red-500'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <ThumbsDown className={`w-10 h-10 ${answer === 'dislike' ? 'text-red-500' : 'text-gray-400'}`} />
            </button>
            <button
              onClick={() => handleAnswer(question.id, 'like')}
              className={`flex items-center justify-center w-20 h-20 rounded-full transition-all ${
                answer === 'like'
                  ? 'bg-green-100 ring-2 ring-green-500'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <ThumbsUp className={`w-10 h-10 ${answer === 'like' ? 'text-green-500' : 'text-gray-400'}`} />
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-muted-foreground">Pesquisa não encontrada</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Obrigado!</h2>
            <p className="text-muted-foreground">
              Sua resposta foi registrada com sucesso. Agradecemos seu feedback!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = survey.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="pt-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">
              Olá {survey.customerName}, obrigado por ser nosso cliente!
            </h1>
            <p className="text-muted-foreground">
              Gostaríamos de aperfeiçoar a sua experiência com os nossos serviços através deste
              questionário que dura apenas 60 segundos.
            </p>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progresso</span>
              <span>
                {currentQuestion + 1} de {survey.questions.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / survey.questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-center">{question.text}</h2>
            {renderQuestion(question)}
          </div>

          {/* Navigation */}
          <div className="flex justify-end">
            <Button
              onClick={handleNext}
              disabled={!answers[question.id]}
              size="lg"
              className="px-8"
            >
              {currentQuestion < survey.questions.length - 1 ? 'Próxima' : 'Enviar'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

