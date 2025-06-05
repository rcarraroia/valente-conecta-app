
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Brain, 
  Send, 
  ArrowLeft
} from 'lucide-react';

interface ChatMessage {
  id: number;
  sender: 'user' | 'ai';
  message: string;
  timestamp: Date;
}

interface AIChatInterfaceProps {
  chatMessages: ChatMessage[];
  userMessage: string;
  isTyping: boolean;
  onUserMessageChange: (value: string) => void;
  onSendMessage: () => void;
  onQuickReply: (reply: string) => void;
}

const AIChatInterface: React.FC<AIChatInterfaceProps> = ({
  chatMessages,
  userMessage,
  isTyping,
  onUserMessageChange,
  onSendMessage,
  onQuickReply
}) => {
  const quickReplies = [
    'Sim, vamos começar',
    'Tenho algumas dúvidas',
    'Prefiro falar com um especialista',
    'Não estou pronto ainda'
  ];

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
                onClick={() => onQuickReply(reply)}
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
            onChange={(e) => onUserMessageChange(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 border-cv-gray-light focus:border-cv-green-mint"
            onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
            aria-label="Digite sua mensagem"
          />
          <Button 
            onClick={onSendMessage}
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
};

export default AIChatInterface;
