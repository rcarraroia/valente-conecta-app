
import React, { useState } from 'react';
import AIIntroScreen from './AIIntroScreen';
import AIChatInterface from './AIChatInterface';

interface ChatMessage {
  id: number;
  sender: 'user' | 'ai';
  message: string;
  timestamp: Date;
}

interface AIAgentScreenProps {
  onBack: () => void;
}

const AIAgentScreen = ({ onBack }: AIAgentScreenProps) => {
  const [currentStep, setCurrentStep] = useState('intro'); // intro, chat, results
  const [userMessage, setUserMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const handleStart = () => {
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
  };

  const handleCancel = () => {
    onBack();
  };

  const sendMessage = () => {
    if (userMessage.trim()) {
      const newMessage: ChatMessage = {
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
        const aiResponse: ChatMessage = {
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

  const handleQuickReply = (reply: string) => {
    setUserMessage(reply);
  };

  if (currentStep === 'intro') {
    return (
      <AIIntroScreen
        onStart={handleStart}
        onCancel={handleCancel}
      />
    );
  }

  if (currentStep === 'chat') {
    return (
      <AIChatInterface
        chatMessages={chatMessages}
        userMessage={userMessage}
        isTyping={isTyping}
        onUserMessageChange={setUserMessage}
        onSendMessage={sendMessage}
        onQuickReply={handleQuickReply}
      />
    );
  }

  // Results screen would go here
  return null;
};

export default AIAgentScreen;
