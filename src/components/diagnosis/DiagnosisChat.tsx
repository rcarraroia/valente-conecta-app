import React, { useEffect, useRef, useState } from 'react';
import { Send, Bot, User, Loader2, AlertCircle, RefreshCw, Smartphone, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDiagnosisChat } from '@/hooks/useDiagnosisChat';
import { useResponsive, useMobileKeyboard, useTouchGestures } from '@/hooks/useResponsive';
import { ChatMessage } from '@/types/diagnosis';
import { WebhookDebugger } from '@/components/debug/WebhookDebugger';

interface DiagnosisChatProps {
  sessionId?: string;
  onSessionComplete?: (sessionId: string) => void;
  className?: string;
  isMobile?: boolean;
  isTouchDevice?: boolean;
  isKeyboardVisible?: boolean;
}

export const DiagnosisChat: React.FC<DiagnosisChatProps> = ({
  sessionId,
  onSessionComplete,
  className = '',
  isMobile: propIsMobile,
  isTouchDevice: propIsTouchDevice,
  isKeyboardVisible: propIsKeyboardVisible
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [showDebugger, setShowDebugger] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Responsive hooks
  const { isMobile, isTablet, isTouchDevice, breakpoint } = useResponsive();
  const { isKeyboardVisible, viewportHeight } = useMobileKeyboard();
  const { touchState, handleTouchGestures } = useTouchGestures();

  // Use props if provided, otherwise use hooks
  const actualIsMobile = propIsMobile ?? isMobile;
  const actualIsTouchDevice = propIsTouchDevice ?? isTouchDevice;
  const actualIsKeyboardVisible = propIsKeyboardVisible ?? isKeyboardVisible;

  const {
    messages,
    isLoading,
    error,
    isTyping,
    sessionId: currentSessionId,
    sendMessage,
    startSession,
    retryLastMessage,
    clearError
  } = useDiagnosisChat();

  // Auto-scroll to latest messages - Mobile optimized
  useEffect(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      // Use different scroll behavior for mobile
      const scrollOptions = actualIsMobile
        ? { behavior: 'smooth' as const, block: 'end' as const }
        : { behavior: 'smooth' as const };

      messagesEndRef.current.scrollIntoView(scrollOptions);
    }
  }, [messages, isTyping, actualIsMobile]);

  // Focus input on mount - Skip on mobile to prevent keyboard popup
  useEffect(() => {
    if (!actualIsMobile && inputRef.current) {
      inputRef.current.focus();
    }
  }, [actualIsMobile]);

  // Handle touch gestures
  useEffect(() => {
    if (actualIsTouchDevice && chatContainerRef.current) {
      const cleanup = handleTouchGestures(chatContainerRef.current);
      return cleanup;
    }
  }, [actualIsTouchDevice, handleTouchGestures]);

  // Handle keyboard visibility changes on mobile
  useEffect(() => {
    if (actualIsMobile && actualIsKeyboardVisible && messagesEndRef.current) {
      // Scroll to bottom when keyboard opens
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, [actualIsMobile, actualIsKeyboardVisible]);

  // Handle session completion - removed automatic completion to avoid redirects
  useEffect(() => {
    if (currentSessionId && onSessionComplete) {
      // Only call onSessionComplete when explicitly needed
      // Removed automatic completion based on AI messages to prevent unwanted redirects
    }
  }, [messages, currentSessionId, onSessionComplete]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage.trim();
    console.log('🎯 DiagnosisChat: handleSendMessage called with:', message);
    setInputMessage('');

    try {
      console.log('🎯 DiagnosisChat: About to call sendMessage hook');
      await sendMessage(message);
      console.log('🎯 DiagnosisChat: sendMessage completed successfully');
    } catch (error) {
      console.error('🎯 DiagnosisChat: Failed to send message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStartSession = async () => {
    try {
      await startSession();
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const formatMessageTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp);
  };

  const renderMessage = (message: ChatMessage, index: number) => {
    const isUser = message.type === 'user';
    const isAI = message.type === 'ai';

    return (
      <div
        key={`${message.id}-${index}`}
        className={`flex gap-2 sm:gap-3 mb-3 sm:mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
      >
        {isAI && (
          <div className={`flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center ${actualIsMobile ? 'w-6 h-6' : 'w-8 h-8'
            }`}>
            <Bot className={`text-blue-600 ${actualIsMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
          </div>
        )}

        <div className={`${actualIsMobile ? 'max-w-[85%]' : 'max-w-[80%]'} ${isUser ? 'order-first' : ''}`}>
          <div
            className={`rounded-lg px-3 sm:px-4 py-2 ${isUser
              ? 'bg-blue-600 text-white ml-auto'
              : 'bg-gray-100 text-gray-900'
              }`}
          >
            <p className={`whitespace-pre-wrap ${actualIsMobile ? 'text-sm' : 'text-sm'}`}>
              {message.content}
            </p>
          </div>

          <div className={`flex items-center gap-1 sm:gap-2 mt-1 text-xs text-gray-500 ${isUser ? 'justify-end' : 'justify-start'
            }`}>
            <span>{formatMessageTime(message.timestamp)}</span>
            {message.status === 'error' && (
              <AlertCircle className="w-3 h-3 text-red-500" />
            )}
          </div>
        </div>

        {isUser && (
          <div className={`flex-shrink-0 bg-blue-600 rounded-full flex items-center justify-center ${actualIsMobile ? 'w-6 h-6' : 'w-8 h-8'
            }`}>
            <User className={`text-white ${actualIsMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
          </div>
        )}
      </div>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <div className={`flex gap-2 sm:gap-3 mb-3 sm:mb-4`}>
        <div className={`flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center ${actualIsMobile ? 'w-6 h-6' : 'w-8 h-8'
          }`}>
          <Bot className={`text-blue-600 ${actualIsMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
        </div>
        <div className="bg-gray-100 rounded-lg px-3 sm:px-4 py-2">
          <div className="flex items-center gap-1">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className={`text-gray-500 ml-2 ${actualIsMobile ? 'text-xs' : 'text-xs'}`}>
              {actualIsMobile ? 'Analisando...' : 'Analisando...'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (!currentSessionId && !sessionId) {
    return (
      <Card className={`text-center ${className} ${actualIsMobile ? 'p-4' : 'p-6'}`}>
        <div className={`mx-auto ${actualIsMobile ? 'max-w-sm' : 'max-w-md'}`}>
          <Bot className={`text-blue-600 mx-auto mb-4 ${actualIsMobile ? 'w-10 h-10' : 'w-12 h-12'}`} />
          <h3 className={`font-semibold mb-2 ${actualIsMobile ? 'text-base' : 'text-lg'}`}>
            Iniciar Pré-Diagnóstico
          </h3>
          <p className={`text-gray-600 mb-4 ${actualIsMobile ? 'text-sm' : ''}`}>
            Converse com nossa IA especializada para obter uma análise inicial dos sintomas.
          </p>
          {actualIsMobile && actualIsTouchDevice && (
            <div className="flex items-center justify-center gap-2 mb-4 text-xs text-gray-500">
              <Smartphone className="w-4 h-4" />
              <span>Otimizado para dispositivos móveis</span>
            </div>
          )}
          <Button
            onClick={handleStartSession}
            disabled={isLoading}
            className="w-full"
            size={actualIsMobile ? "default" : "default"}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Iniciando...
              </>
            ) : (
              'Iniciar Conversa'
            )}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card
      ref={chatContainerRef}
      className={`flex flex-col ${className}`}
      style={{
        height: actualIsMobile && actualIsKeyboardVisible
          ? `${viewportHeight - 100}px`
          : actualIsMobile
            ? '100vh'
            : '600px',
        maxHeight: actualIsMobile ? '100vh' : '600px',
      }}
    >
      {/* Header - Responsive */}
      <div className={`flex items-center justify-between border-b flex-shrink-0 ${actualIsMobile ? 'p-3' : 'p-4'
        }`}>
        <div className="flex items-center gap-2 overflow-hidden">
          <Bot className={`text-blue-600 flex-shrink-0 ${actualIsMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
          <h3 className={`font-semibold truncate ${actualIsMobile ? 'text-sm' : 'text-base'}`}>
            {actualIsMobile ? 'Assistente IA' : 'Assistente de Pré-Diagnóstico'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDebugger(!showDebugger)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Bug className="w-4 h-4" />
            {!actualIsMobile && <span className="ml-1 text-xs">Debug</span>}
          </Button>
          <div className={`text-gray-500 flex-shrink-0 ${actualIsMobile ? 'text-xs' : 'text-xs'}`}>
            {actualIsMobile ? currentSessionId?.slice(-6) : `Sessão: ${currentSessionId?.slice(-8)}`}
          </div>
        </div>
      </div>

      {/* Messages Area - Responsive */}
      <div className={`flex-1 overflow-y-auto space-y-2 sm:space-y-4 ${actualIsMobile ? 'p-3' : 'p-4'
        }`} style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain'
        }}>
        {messages.length === 0 && !isLoading && (
          <div className={`text-center text-gray-500 ${actualIsMobile ? 'py-6' : 'py-8'}`}>
            <Bot className={`mx-auto mb-2 text-gray-400 ${actualIsMobile ? 'w-6 h-6' : 'w-8 h-8'}`} />
            <p className={actualIsMobile ? 'text-sm' : ''}>
              Olá! Sou seu assistente de pré-diagnóstico.
            </p>
            <p className={`mt-1 ${actualIsMobile ? 'text-xs' : 'text-sm'}`}>
              Como posso ajudá-lo hoje?
            </p>
          </div>
        )}

        {messages.map((message, index) => renderMessage(message, index))}
        {renderTypingIndicator()}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Display - Responsive */}
      {error && (
        <div className={`pb-2 flex-shrink-0 ${actualIsMobile ? 'px-3' : 'px-4'}`}>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className={`${actualIsMobile ? 'flex-col gap-2' : 'flex items-center justify-between'}`}>
              <span className={actualIsMobile ? 'text-sm' : ''}>{error}</span>
              <div className={`flex gap-2 ${actualIsMobile ? 'justify-end' : ''}`}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={retryLastMessage}
                  disabled={isLoading}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  {actualIsMobile ? 'Tentar' : 'Tentar Novamente'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearError}
                >
                  Fechar
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Input Area - Mobile Optimized */}
      <div className={`border-t flex-shrink-0 ${actualIsMobile ? 'p-3' : 'p-4'}`}>
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={actualIsMobile ? "Sua mensagem..." : "Digite sua mensagem..."}
            disabled={isLoading}
            className={`flex-1 ${actualIsMobile ? 'text-base' : ''}`}
            style={{
              fontSize: actualIsMobile ? '16px' : undefined, // Prevent zoom on iOS
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            size={actualIsMobile ? "default" : "icon"}
            aria-label="Enviar mensagem"
            className={actualIsMobile ? 'px-4' : ''}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                {actualIsMobile && <span className="ml-2 text-sm">Enviar</span>}
              </>
            )}
          </Button>
        </div>

        {!actualIsKeyboardVisible && (
          <div className={`flex items-center justify-between mt-2 text-gray-500 ${actualIsMobile ? 'text-xs' : 'text-xs'
            }`}>
            <span>
              {actualIsMobile ? 'Enter para enviar' : 'Pressione Enter para enviar'}
            </span>
            {isLoading && (
              <span className="flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Processando...
              </span>
            )}
          </div>
        )}
      </div>

      {/* Debug Panel */}
      {showDebugger && (
        <div className="border-t">
          <WebhookDebugger />
        </div>
      )}
    </Card>
  );
};