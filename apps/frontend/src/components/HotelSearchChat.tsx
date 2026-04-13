'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Composant de chat sécurisé pour la recherche d'hôtels
 *
 * Ce composant implémente les bonnes pratiques de sécurité côté client:
 * - Validation des entrées avant envoi
 * - Génération sécurisée des IDs de session
 * - Protection contre les attaques XSS dans l'affichage
 * - Rate limiting côté client
 */

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  data?: {
    hotels?: Hotel[];
    filters?: any;
    suggestions?: string[];
  };
}

interface Hotel {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  stars: number;
  short_description?: string;
  cover_image?: string;
  amenities?: string[];
  is_featured?: boolean;
}

interface ChatResponse {
  type: string;
  message: string;
  data?: {
    hotels?: Hotel[];
    filters?: any;
    suggestions?: string[];
  };
}

// Génération sécurisée d'un ID de session (crypto API)
function generateSecureSessionId(): string {
  if (typeof window !== 'undefined' && window.crypto) {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  // Fallback moins sécurisé
  return 'session-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2);
}

// Validation basique côté client
function validateMessage(message: string): { valid: boolean; error?: string } {
  if (!message || message.trim().length === 0) {
    return { valid: false, error: 'Le message ne peut pas être vide' };
  }
  if (message.length > 500) {
    return { valid: false, error: 'Le message est trop long (500 caractères max)' };
  }
  // Détection basique des patterns suspects (la vraie validation est côté serveur)
  const suspiciousPatterns = [/<script/i, /javascript:/i, /on\w+=/i];
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(message)) {
      return { valid: false, error: 'Message non autorisé' };
    }
  }
  return { valid: true };
}

// Sanitisation de l'affichage HTML
function sanitizeForDisplay(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default function HotelSearchChat() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => generateSecureSessionId());
  const [error, setError] = useState('');
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const MIN_REQUEST_INTERVAL = 1000; // 1 seconde entre les requêtes

  // Message de bienvenue initial
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: `Bonjour ! Je suis votre assistant de recherche d'hôtels.

Dites-moi ce que vous recherchez, par exemple :
- "Hôtels à Paris"
- "Hôtel 4 étoiles avec piscine"
- "Chambre pour 2 personnes à Moroni"

Comment puis-je vous aider ?`,
      timestamp: new Date(),
      data: {
        suggestions: [
          'Hôtels à Paris',
          'Hôtels 5 étoiles',
          'Hôtels avec spa',
        ],
      },
    };
    setMessages([welcomeMessage]);
  }, []);

  // Scroll automatique vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (messageText?: string) => {
    const text = messageText || inputValue.trim();

    if (!text) return;

    // Rate limiting côté client
    const now = Date.now();
    if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
      setError('Veuillez patienter avant d\'envoyer un autre message');
      return;
    }

    // Validation côté client
    const validation = validateMessage(text);
    if (!validation.valid) {
      setError(validation.error || 'Message invalide');
      return;
    }

    setError('');
    setLastRequestTime(now);

    // Ajouter le message utilisateur
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/chatbot/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          sessionId: sessionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erreur de communication avec le serveur');
      }

      const data: ChatResponse = await response.json();

      // Ajouter la réponse de l'assistant
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        data: data.data,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Désolé, une erreur est survenue. Veuillez réessayer.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleHotelClick = (hotel: Hotel) => {
    router.push(`/hotels/${hotel.slug}`);
  };

  const renderStars = (count: number) => {
    return '⭐'.repeat(count);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-[600px]">
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
            🏨
          </div>
          <div>
            <h2 className="font-semibold">Assistant Recherche d'Hôtels</h2>
            <p className="text-sm text-blue-100">Recherche sécurisée</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-blue-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white shadow-sm border'
              }`}
            >
              {/* Contenu du message (sanitisé pour l'affichage) */}
              <div className="whitespace-pre-wrap text-sm">
                {message.content}
              </div>

              {/* Affichage des hôtels trouvés */}
              {message.data?.hotels && message.data.hotels.length > 0 && (
                <div className="mt-4 space-y-3">
                  {message.data.hotels.map((hotel) => (
                    <div
                      key={hotel.id}
                      onClick={() => handleHotelClick(hotel)}
                      className="bg-blue-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors border"
                    >
                      <div className="flex items-start gap-3">
                        {hotel.cover_image ? (
                          <img
                            src={hotel.cover_image}
                            alt={sanitizeForDisplay(hotel.name)}
                            className="w-16 h-16 rounded object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded bg-blue-100 flex items-center justify-center text-2xl">
                            🏨
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {sanitizeForDisplay(hotel.name)}
                            </h4>
                            {hotel.is_featured && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                                En vedette
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            📍 {sanitizeForDisplay(hotel.city)}, {sanitizeForDisplay(hotel.country)}
                          </p>
                          <p className="text-yellow-500 text-sm">
                            {renderStars(hotel.stars)}
                          </p>
                          {hotel.short_description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {sanitizeForDisplay(hotel.short_description)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {message.data?.suggestions && message.data.suggestions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.data.suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {/* Timestamp */}
              <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {/* Indicateur de chargement */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white shadow-sm border rounded-lg px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Erreur */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-100">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Zone de saisie */}
      <div className="border-t bg-white p-4">
        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Décrivez l'hôtel que vous recherchez..."
            maxLength={500}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={isLoading || !inputValue.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Envoyer'
            )}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          🔒 Recherche sécurisée - Les messages sont validés et filtrés
        </p>
      </div>
    </div>
  );
}
