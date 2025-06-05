
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Send, 
  ArrowLeft, 
  Shield, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Calendar,
  Users,
  BookOpen
} from 'lucide-react';

const AIAgentScreen = () => {
  const [currentStep, setCurrentStep] = useState('intro'); // intro, consent, chat, results
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const handleStartChat = () => {
    if (consentAccepted) {
      setCurrentStep('chat');
      // Simulate initial AI message
      setChatMessages([
        {
          id: 1,
          sender: 'ai',
          message: 'Olá! Sou o assistente do Coração Valente. Vou fazer algumas perguntas para te ajudar a identificar possíveis sinais relacionados ao neurodesenvolvimento. Vamos começar?',
          timestamp: new Date()
        }
      ]);
    }
  };

  const sendMessage = () => {
    if (userMessage.trim()) {
      const newMessage = {
        id: chatMessages.length + 1,
        sender: 'user',
        message: userMessage,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, newMessage]);
      setUserMessage('');
      setIsTyping(true);
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse = {
          id: chatMessages.length + 2,
          sender: 'ai',
          message: 'Entendi. Pode me contar mais sobre isso? Quando você notou esses sinais pela primeira vez?',
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, aiResponse]);
        setIsTyping(false);
      }, 2000);
    }
  };

  const quickReplies = [
    'Sim, vamos começar',
    'Tenho algumas dúvidas',
    'Prefiro falar com um especialista',
    'Não estou pronto ainda'
  ];

  if (currentStep === 'intro') {
    return (
      <div className="min-h-screen bg-cv-off-white p-6">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="ghost" size="icon" aria-label="Voltar">
            <ArrowLeft className="h-6 w-6 text-cv-gray-dark" />
          </Button>
          <div>
            <h1 className="text-h2 font-heading font-bold text-cv-gray-dark">Orientação Inteligente</h1>
            <p className="text-body text-cv-gray-light">Powered by IA</p>
          </div>
        </div>

        {/* AI Avatar */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-cv-green-mint rounded-full flex items-center justify-center shadow-lg">
            <Brain className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Introduction */}
        <Card className="bg-white border-none shadow-lg mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-h2 font-heading text-cv-gray-dark">
              Como posso te ajudar?
            </CardTitle>
            <CardDescription className="text-body text-cv-gray-light">
              Nosso Agente de IA pode te ajudar a identificar possíveis sinais de condições do neurodesenvolvimento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-cv-yellow-soft/20 p-4 rounded-lg border-l-4 border-cv-yellow-soft">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-cv-coral" />
                <span className="font-semibold text-cv-gray-dark">Importante</span>
              </div>
              <p className="text-body text-cv-gray-dark">
                Esta ferramenta oferece uma orientação inicial e <strong>NÃO substitui</strong> o diagnóstico profissional.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-6">
              <div className="flex items-center space-x-3 p-3 bg-cv-blue-soft/10 rounded-lg">
                <Shield className="w-6 h-6 text-cv-blue-soft" />
                <div>
                  <h4 className="font-semibold text-cv-gray-dark">Seguro e Confidencial</h4>
                  <p className="text-caption text-cv-gray-light">Suas informações são protegidas</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-cv-green-mint/10 rounded-lg">
                <Clock className="w-6 h-6 text-cv-green-mint" />
                <div>
                  <h4 className="font-semibold text-cv-gray-dark">Rápido e Eficiente</h4>
                  <p className="text-caption text-cv-gray-light">Processo leva cerca de 10-15 minutos</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consent Section */}
        <Card className="bg-white border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-h3 font-heading text-cv-gray-dark">
              Termo de Consentimento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-body text-cv-gray-dark">
              <p>Ao prosseguir, você declara que:</p>
              <ul className="space-y-2 list-disc list-inside text-cv-gray-light">
                <li>Entende que esta é uma orientação inicial</li>
                <li>Não substitui consulta com profissional qualificado</li>
                <li>Concorda com o uso responsável das informações</li>
                <li>Está ciente que é necessário buscar ajuda profissional</li>
              </ul>
            </div>
            
            <div className="flex items-start space-x-3 pt-4">
              <Checkbox 
                id="consent" 
                checked={consentAccepted}
                onCheckedChange={setConsentAccepted}
                className="mt-1"
              />
              <label htmlFor="consent" className="text-body text-cv-gray-dark cursor-pointer">
                Li e aceito os termos acima. Entendo que esta ferramenta oferece orientação inicial e não substitui avaliação profissional.
              </label>
            </div>

            <Button 
              onClick={handleStartChat}
              disabled={!consentAccepted}
              className="w-full bg-cv-green-mint hover:bg-cv-green-mint/90 text-white font-semibold py-3 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              size="lg"
            >
              <Brain className="mr-2 h-5 w-5" />
              Iniciar Conversa
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'chat') {
    return (
      <div className="min-h-screen bg-cv-off-white flex flex-col">
        {/* Header */}
        <div className="bg-cv-blue-soft text-white p-4 shadow-lg">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="text-white" aria-label="Voltar">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-cv-green-mint rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-semibold">Assistente IA</h1>
                <p className="text-sm opacity-90">Online</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {chatMessages.map((message) => (
            <div 
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] p-4 rounded-2xl shadow-md ${
                  message.sender === 'user' 
                    ? 'bg-cv-green-mint text-white ml-12' 
                    : 'bg-white text-cv-gray-dark mr-12'
                }`}
              >
                <p className="text-body">{message.message}</p>
                <p className={`text-xs mt-2 ${
                  message.sender === 'user' ? 'text-white/70' : 'text-cv-gray-light'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white text-cv-gray-dark p-4 rounded-2xl shadow-md mr-12">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-cv-gray-light rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-cv-gray-light rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-cv-gray-light rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Replies */}
        {chatMessages.length === 1 && (
          <div className="p-4 space-y-2">
            <p className="text-caption text-cv-gray-light mb-2">Respostas rápidas:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickReplies.map((reply, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setUserMessage(reply)}
                  className="text-cv-gray-dark border-cv-gray-light hover:border-cv-green-mint hover:text-cv-green-mint"
                >
                  {reply}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="p-4 bg-white border-t border-cv-gray-light">
          <div className="flex items-center space-x-3">
            <Input
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 border-cv-gray-light focus:border-cv-green-mint"
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              aria-label="Digite sua mensagem"
            />
            <Button 
              onClick={sendMessage}
              size="icon"
              className="bg-cv-green-mint hover:bg-cv-green-mint/90 text-white shadow-lg"
              aria-label="Enviar mensagem"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Results screen would go here
  return null;
};

export default AIAgentScreen;
