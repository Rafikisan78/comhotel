import { Injectable, BadRequestException } from "@nestjs/common";
import { SupabaseService } from "../../common/database/supabase.service";

/**
 * Service de chatbot sécurisé pour la recherche d'hôtels
 *
 * Protections OWASP Top 10 pour l'IA (2026):
 * - LLM01: Injection de prompt - Sanitisation et validation stricte
 * - LLM02: Gestion non sécurisée des sorties - Réponses structurées uniquement
 * - LLM03: Empoisonnement des données d'entraînement - N/A (pas de modèle ML)
 * - LLM04: Déni de service - Rate limiting et validation de longueur
 * - LLM05: Vulnérabilités de la chaîne d'approvisionnement - N/A
 * - LLM06: Divulgation d'informations sensibles - Filtrage strict des sorties
 * - LLM07: Conception de plugins non sécurisée - Architecture fermée
 * - LLM08: Agence excessive - Actions limitées (lecture seule)
 * - LLM09: Dépendance excessive - Validation des entrées/sorties
 * - LLM10: Vol de modèle - N/A
 *
 * Protections MITRE ATLAS:
 * - AML.T0043: Craft Adversarial Data - Validation des entrées
 * - AML.T0040: ML Model Inference API Access - Rate limiting
 * - AML.T0042: Verify Attack - Logging des requêtes suspectes
 * - AML.T0048: Prompt Injection - Sanitisation des prompts
 */

// Types de réponse autorisés (whitelist)
export type AllowedResponseType =
  | "hotel_list"
  | "hotel_filter"
  | "availability_check"
  | "error"
  | "help";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  type: AllowedResponseType;
  message: string;
  data?: {
    hotels?: any[];
    filters?: SearchFilters;
    suggestions?: string[];
  };
  securityInfo?: {
    inputSanitized: boolean;
    riskLevel: "low" | "medium" | "high";
  };
}

export interface SearchFilters {
  city?: string;
  country?: string;
  minStars?: number;
  maxStars?: number;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  maxPrice?: number;
  amenities?: string[];
}

// Patterns d'attaque connus (MITRE ATLAS)
const ATTACK_PATTERNS = {
  // Injection de prompt
  promptInjection: [
    /ignore\s+(previous|all|above)\s+(instructions?|prompts?)/i,
    /forget\s+(everything|all|previous)/i,
    /disregard\s+(previous|all|above)/i,
    /new\s+instructions?:/i,
    /system\s*:\s*/i,
    /\[INST\]/i,
    /\[\/INST\]/i,
    /<\|im_start\|>/i,
    /<\|im_end\|>/i,
    /```system/i,
    /role\s*:\s*(system|admin)/i,
  ],
  // Tentatives d'extraction de données
  dataExfiltration: [
    /show\s+(me\s+)?(all\s+)?(user|admin|password|secret|key|token)/i,
    /list\s+(all\s+)?(users?|admins?|credentials?)/i,
    /database\s+(dump|export|backup)/i,
    /sql\s+(inject|query|select|insert|update|delete)/i,
    /\b(select|insert|update|delete|drop|union)\s+/i,
  ],
  // Tentatives de manipulation du système
  systemManipulation: [
    /execute\s+(command|code|script)/i,
    /run\s+(shell|bash|cmd|powershell)/i,
    /eval\s*\(/i,
    /process\.(env|exit|kill)/i,
    /require\s*\(/i,
    /import\s+os/i,
    /__proto__/i,
    /constructor\s*\[/i,
  ],
  // XSS et injection HTML
  xssAttempts: [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /data:\s*text\/html/i,
  ],
};

// Mots-clés autorisés pour la recherche d'hôtels (whitelist)
const HOTEL_KEYWORDS = {
  cities: [
    "paris",
    "moroni",
    "tokyo",
    "new york",
    "londres",
    "london",
    "dubai",
    "rome",
    "barcelone",
    "barcelona",
    "amsterdam",
    "berlin",
    "madrid",
    "lisbonne",
    "lisbon",
    "prague",
    "vienne",
    "vienna",
    "budapest",
    "athenes",
    "athens",
  ],
  roomTypes: [
    "simple",
    "double",
    "suite",
    "familiale",
    "family",
    "deluxe",
    "standard",
    "premium",
    "penthouse",
  ],
  amenities: [
    "wifi",
    "piscine",
    "pool",
    "spa",
    "gym",
    "restaurant",
    "parking",
    "climatisation",
    "ac",
    "minibar",
    "vue mer",
    "sea view",
    "balcon",
    "balcony",
    "terrasse",
    "terrace",
  ],
  actions: [
    "cherche",
    "recherche",
    "trouve",
    "montre",
    "affiche",
    "liste",
    "voir",
    "search",
    "find",
    "show",
    "list",
    "display",
    "disponible",
    "available",
    "réserver",
    "book",
  ],
  filters: [
    "étoiles",
    "stars",
    "prix",
    "price",
    "budget",
    "personnes",
    "guests",
    "adultes",
    "adults",
    "enfants",
    "children",
    "nuits",
    "nights",
  ],
};

@Injectable()
export class ChatbotService {
  private conversationHistory: Map<string, ChatMessage[]> = new Map();
  private requestCounts: Map<string, { count: number; resetAt: Date }> =
    new Map();

  // Limites de sécurité
  private readonly MAX_MESSAGE_LENGTH = 500;
  private readonly MAX_REQUESTS_PER_MINUTE = 20;
  private readonly MAX_CONVERSATION_HISTORY = 10;
  private readonly SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Point d'entrée principal - Traite un message utilisateur de manière sécurisée
   */
  async processMessage(
    sessionId: string,
    userMessage: string,
    clientIp?: string,
  ): Promise<ChatResponse> {
    // 1. Rate limiting (OWASP LLM04, MITRE AML.T0040)
    this.checkRateLimit(sessionId);

    // 2. Validation et sanitisation de l'entrée (OWASP LLM01, MITRE AML.T0048)
    const sanitizationResult = this.sanitizeInput(userMessage);

    if (sanitizationResult.blocked) {
      this.logSecurityEvent("BLOCKED_INPUT", sessionId, userMessage, clientIp);
      return {
        type: "error",
        message:
          "Votre message contient des éléments non autorisés. Veuillez reformuler votre demande de recherche d'hôtel.",
        securityInfo: {
          inputSanitized: true,
          riskLevel: "high",
        },
      };
    }

    const sanitizedMessage = sanitizationResult.sanitized;

    // 3. Analyse de l'intention (limitée aux actions de recherche d'hôtels)
    const intent = this.analyzeIntent(sanitizedMessage);

    // 4. Exécution de l'action autorisée
    const response = await this.executeIntent(
      intent,
      sanitizedMessage,
      sessionId,
    );

    // 5. Validation de la sortie (OWASP LLM02, LLM06)
    const validatedResponse = this.validateOutput(response);

    // 6. Mise à jour de l'historique de conversation
    this.updateConversationHistory(
      sessionId,
      userMessage,
      validatedResponse.message,
    );

    return validatedResponse;
  }

  /**
   * Rate limiting pour prévenir les abus (OWASP LLM04)
   */
  private checkRateLimit(sessionId: string): void {
    const now = new Date();
    const requestData = this.requestCounts.get(sessionId);

    if (!requestData || requestData.resetAt < now) {
      this.requestCounts.set(sessionId, {
        count: 1,
        resetAt: new Date(now.getTime() + 60000), // Reset dans 1 minute
      });
      return;
    }

    if (requestData.count >= this.MAX_REQUESTS_PER_MINUTE) {
      throw new BadRequestException(
        "Trop de requêtes. Veuillez patienter avant de réessayer.",
      );
    }

    requestData.count++;
  }

  /**
   * Sanitisation des entrées utilisateur (OWASP LLM01, MITRE AML.T0043, AML.T0048)
   */
  private sanitizeInput(input: string): {
    sanitized: string;
    blocked: boolean;
    threats: string[];
  } {
    const threats: string[] = [];

    // Vérification de la longueur
    if (!input || input.length === 0) {
      return { sanitized: "", blocked: false, threats: [] };
    }

    if (input.length > this.MAX_MESSAGE_LENGTH) {
      return { sanitized: "", blocked: true, threats: ["MESSAGE_TOO_LONG"] };
    }

    // Détection des patterns d'attaque
    for (const [category, patterns] of Object.entries(ATTACK_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(input)) {
          threats.push(`${category.toUpperCase()}_DETECTED`);
        }
      }
    }

    if (threats.length > 0) {
      return { sanitized: "", blocked: true, threats };
    }

    // Sanitisation basique
    const sanitized = input
      .trim()
      .replace(/[<>]/g, "") // Suppression des chevrons
      .replace(/[\x00-\x1F\x7F]/g, "") // Suppression des caractères de contrôle
      .replace(/\s+/g, " ") // Normalisation des espaces
      .substring(0, this.MAX_MESSAGE_LENGTH);

    // Vérification que le message contient des mots-clés liés aux hôtels
    const hasHotelContext = this.hasHotelContext(sanitized.toLowerCase());

    if (!hasHotelContext && sanitized.length > 20) {
      // Message long sans contexte hôtelier - potentiellement suspect
      threats.push("NO_HOTEL_CONTEXT");
    }

    return { sanitized, blocked: false, threats };
  }

  /**
   * Vérifie si le message a un contexte lié aux hôtels
   * Accepte aussi les messages courts (noms de villes) comme contexte valide
   */
  private hasHotelContext(message: string): boolean {
    // Les messages courts (< 30 chars) sont probablement des noms de ville/hôtel
    if (message.length <= 30) {
      return true;
    }

    const allKeywords = [
      ...HOTEL_KEYWORDS.cities,
      ...HOTEL_KEYWORDS.roomTypes,
      ...HOTEL_KEYWORDS.amenities,
      ...HOTEL_KEYWORDS.actions,
      ...HOTEL_KEYWORDS.filters,
      "hotel",
      "hôtel",
      "chambre",
      "room",
      "réservation",
      "booking",
      "séjour",
      "stay",
    ];

    return allKeywords.some((keyword) =>
      message.includes(keyword.toLowerCase()),
    );
  }

  /**
   * Analyse l'intention de l'utilisateur (limitée aux actions autorisées)
   */
  private analyzeIntent(message: string): {
    action: string;
    params: SearchFilters;
    searchQuery?: string;
  } {
    const lowerMessage = message.toLowerCase();
    const params: SearchFilters = {};

    // Extraction de la ville depuis la liste connue
    for (const city of HOTEL_KEYWORDS.cities) {
      if (lowerMessage.includes(city)) {
        params.city = city.charAt(0).toUpperCase() + city.slice(1);
        break;
      }
    }

    // Si aucune ville connue, extraire le terme de recherche libre
    // pour rechercher dans name, city, description via ilike
    let searchQuery: string | undefined;
    if (!params.city) {
      // Extraire le terme après "à", "a", "in", ou utiliser le message brut
      const cityMatch = lowerMessage.match(
        /(?:à|a|in|de|dans)\s+([a-zàâäéèêëïîôùûüÿçœæ\s-]+?)(?:\s+(?:avec|pour|du|\d)|$)/i,
      );
      if (cityMatch) {
        searchQuery = cityMatch[1].trim();
      } else {
        // Si le message est un seul mot ou nom, l'utiliser comme recherche
        const cleaned = lowerMessage
          .replace(
            /\b(hotel|hôtel|cherche|recherche|trouve|montre|affiche|liste|voir|disponible|étoiles?|stars?|avec|pour|les|des|un|une|je|moi|le|la)\b/gi,
            "",
          )
          .trim();
        if (cleaned.length >= 3) {
          searchQuery = cleaned;
        }
      }
    }

    // Extraction du nombre d'étoiles
    const starsMatch = lowerMessage.match(/(\d)\s*(étoiles?|stars?)/);
    if (starsMatch) {
      params.minStars = parseInt(starsMatch[1], 10);
    }

    // Extraction du nombre de personnes
    const guestsMatch = lowerMessage.match(
      /(\d+)\s*(personnes?|guests?|adultes?|adults?)/,
    );
    if (guestsMatch) {
      params.guests = parseInt(guestsMatch[1], 10);
    }

    // Extraction des dates (format simple)
    const dateMatch = lowerMessage.match(
      /du\s+(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)\s+au\s+(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)/,
    );
    if (dateMatch) {
      params.checkIn = this.parseDate(dateMatch[1]);
      params.checkOut = this.parseDate(dateMatch[2]);
    }

    // Extraction des équipements souhaités
    const amenities: string[] = [];
    for (const amenity of HOTEL_KEYWORDS.amenities) {
      if (lowerMessage.includes(amenity)) {
        amenities.push(amenity);
      }
    }
    if (amenities.length > 0) {
      params.amenities = amenities;
    }

    // Extraction du budget maximum
    const priceMatch = lowerMessage.match(
      /(?:moins\s+de|max(?:imum)?|budget)\s*:?\s*(\d+)\s*(?:€|euros?)?/i,
    );
    if (priceMatch) {
      params.maxPrice = parseInt(priceMatch[1], 10);
    }

    // Détermination de l'action
    let action = "search";
    if (
      lowerMessage.includes("aide") ||
      lowerMessage.includes("help") ||
      lowerMessage.includes("comment")
    ) {
      action = "help";
    } else if (
      lowerMessage.includes("disponible") ||
      lowerMessage.includes("available")
    ) {
      action = "check_availability";
    }

    return { action, params, searchQuery };
  }

  /**
   * Parse une date au format simple
   */
  private parseDate(dateStr: string): string {
    const parts = dateStr.split(/[\/\-]/);
    if (parts.length >= 2) {
      const day = parts[0].padStart(2, "0");
      const month = parts[1].padStart(2, "0");
      const year = parts[2]
        ? parts[2].length === 2
          ? "20" + parts[2]
          : parts[2]
        : new Date().getFullYear().toString();
      return `${year}-${month}-${day}`;
    }
    return "";
  }

  /**
   * Exécute l'intention identifiée (actions en lecture seule - OWASP LLM08)
   */
  private async executeIntent(
    intent: { action: string; params: SearchFilters; searchQuery?: string },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _originalMessage: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _sessionId: string,
  ): Promise<ChatResponse> {
    const supabase = this.supabaseService.getClient();

    switch (intent.action) {
      case "help":
        return this.getHelpResponse();

      case "check_availability":
      case "search":
      default:
        // Construction de la requête — uniquement les hôtels avec des chambres
        let query = supabase
          .from("hotels")
          .select(
            "id, name, slug, city, country, stars, short_description, cover_image, amenities, is_active, is_featured, rooms!inner(id)",
          )
          .eq("is_active", true)
          .order("is_featured", { ascending: false })
          .order("stars", { ascending: false })
          .limit(10);

        // Application des filtres
        if (intent.params.city) {
          query = query.ilike("city", `%${intent.params.city}%`);
        } else if (intent.searchQuery) {
          // Recherche libre sur nom, ville, pays, description
          const term = `%${intent.searchQuery}%`;
          query = query.or(
            `name.ilike.${term},city.ilike.${term},country.ilike.${term},description.ilike.${term},short_description.ilike.${term}`,
          );
        }

        if (intent.params.minStars) {
          query = query.gte("stars", intent.params.minStars);
        }

        const { data: hotels, error } = await query;

        if (error) {
          console.error("Database error:", error);
          return {
            type: "error",
            message:
              "Une erreur est survenue lors de la recherche. Veuillez réessayer.",
            securityInfo: { inputSanitized: true, riskLevel: "low" },
          };
        }

        // Construction de la réponse
        const filterDescription = this.buildFilterDescription(intent.params);
        const message =
          hotels && hotels.length > 0
            ? `J'ai trouvé ${hotels.length} hôtel${hotels.length > 1 ? "s" : ""} ${filterDescription}. Voici les résultats :`
            : `Aucun hôtel trouvé ${filterDescription}. Essayez avec d'autres critères.`;

        return {
          type: "hotel_list",
          message,
          data: {
            hotels: hotels || [],
            filters: intent.params,
            suggestions: this.generateSuggestions(
              intent.params,
              hotels?.length || 0,
            ),
          },
          securityInfo: { inputSanitized: true, riskLevel: "low" },
        };
    }
  }

  /**
   * Construit une description des filtres appliqués
   */
  private buildFilterDescription(params: SearchFilters): string {
    const parts: string[] = [];

    if (params.city) {
      parts.push(`à ${params.city}`);
    }
    if (params.minStars) {
      parts.push(`${params.minStars} étoiles minimum`);
    }
    if (params.guests) {
      parts.push(
        `pour ${params.guests} personne${params.guests > 1 ? "s" : ""}`,
      );
    }
    if (params.amenities && params.amenities.length > 0) {
      parts.push(`avec ${params.amenities.join(", ")}`);
    }

    return parts.length > 0 ? parts.join(", ") : "";
  }

  /**
   * Génère des suggestions pour affiner la recherche
   */
  private generateSuggestions(
    currentParams: SearchFilters,
    resultCount: number,
  ): string[] {
    const suggestions: string[] = [];

    if (resultCount === 0) {
      suggestions.push("Essayez une recherche sans filtre de ville");
      suggestions.push("Réduisez le nombre d'étoiles minimum");
    } else if (resultCount > 5) {
      if (!currentParams.minStars) {
        suggestions.push('Filtrer par nombre d\'étoiles (ex: "3 étoiles")');
      }
      if (!currentParams.city) {
        suggestions.push('Précisez une ville (ex: "à Paris")');
      }
    }

    if (!currentParams.amenities || currentParams.amenities.length === 0) {
      suggestions.push(
        "Ajoutez des équipements souhaités (piscine, spa, wifi...)",
      );
    }

    return suggestions.slice(0, 3);
  }

  /**
   * Retourne le message d'aide
   */
  private getHelpResponse(): ChatResponse {
    return {
      type: "help",
      message: `Je suis votre assistant de recherche d'hôtels. Voici comment je peux vous aider :

**Recherche simple :**
- "Trouve-moi un hôtel à Paris"
- "Hôtels 4 étoiles"

**Recherche avec filtres :**
- "Hôtel avec piscine et spa à Moroni"
- "Chambre pour 2 personnes à Tokyo"

**Vérification de disponibilité :**
- "Hôtel disponible du 15/02 au 20/02"

Je ne peux vous aider que pour la recherche d'hôtels. Pour toute autre demande, veuillez contacter notre service client.`,
      data: {
        suggestions: [
          "Hôtels à Paris",
          "Hôtels 5 étoiles avec piscine",
          "Hôtels disponibles ce week-end",
        ],
      },
      securityInfo: { inputSanitized: true, riskLevel: "low" },
    };
  }

  /**
   * Validation des sorties (OWASP LLM02, LLM06)
   */
  private validateOutput(response: ChatResponse): ChatResponse {
    // S'assurer que seuls les types de réponse autorisés sont retournés
    const allowedTypes: AllowedResponseType[] = [
      "hotel_list",
      "hotel_filter",
      "availability_check",
      "error",
      "help",
    ];

    if (!allowedTypes.includes(response.type)) {
      return {
        type: "error",
        message: "Une erreur est survenue. Veuillez réessayer.",
        securityInfo: { inputSanitized: true, riskLevel: "medium" },
      };
    }

    // Filtrer les données sensibles des hôtels
    if (response.data?.hotels) {
      response.data.hotels = response.data.hotels.map((hotel) => ({
        id: hotel.id,
        name: hotel.name,
        slug: hotel.slug,
        city: hotel.city,
        country: hotel.country,
        stars: hotel.stars,
        short_description: hotel.short_description,
        cover_image: hotel.cover_image,
        amenities: hotel.amenities,
        is_featured: hotel.is_featured,
        // Exclusion explicite des champs sensibles
      }));
    }

    // Sanitisation du message de sortie
    response.message = response.message
      .replace(/<script[^>]*>.*?<\/script>/gi, "")
      .replace(/javascript:/gi, "")
      .substring(0, 2000);

    return response;
  }

  /**
   * Mise à jour de l'historique de conversation
   */
  private updateConversationHistory(
    sessionId: string,
    userMessage: string,
    assistantMessage: string,
  ): void {
    let history = this.conversationHistory.get(sessionId) || [];

    history.push(
      { role: "user", content: userMessage, timestamp: new Date() },
      { role: "assistant", content: assistantMessage, timestamp: new Date() },
    );

    // Limiter la taille de l'historique
    if (history.length > this.MAX_CONVERSATION_HISTORY * 2) {
      history = history.slice(-this.MAX_CONVERSATION_HISTORY * 2);
    }

    this.conversationHistory.set(sessionId, history);

    // Nettoyage des sessions expirées
    this.cleanupExpiredSessions();
  }

  /**
   * Nettoyage des sessions expirées
   */
  private cleanupExpiredSessions(): void {
    const now = new Date().getTime();

    for (const [sessionId, history] of this.conversationHistory.entries()) {
      const lastMessage = history[history.length - 1];
      if (
        lastMessage &&
        now - lastMessage.timestamp.getTime() > this.SESSION_TIMEOUT_MS
      ) {
        this.conversationHistory.delete(sessionId);
        this.requestCounts.delete(sessionId);
      }
    }
  }

  /**
   * Journalisation des événements de sécurité (MITRE AML.T0042)
   */
  private logSecurityEvent(
    eventType: string,
    sessionId: string,
    input: string,
    clientIp?: string,
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      eventType,
      sessionId: sessionId.substring(0, 8) + "...", // Anonymisation partielle
      inputPreview: input.substring(0, 50) + (input.length > 50 ? "..." : ""),
      clientIp: clientIp ? this.anonymizeIp(clientIp) : "unknown",
    };

    console.warn("[SECURITY EVENT]", JSON.stringify(logEntry));

    // TODO: Envoyer vers un système de SIEM en production
  }

  /**
   * Anonymisation partielle de l'adresse IP
   */
  private anonymizeIp(ip: string): string {
    const parts = ip.split(".");
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.xxx.xxx`;
    }
    return "anonymized";
  }

  /**
   * Récupère l'historique de conversation (pour le frontend)
   */
  getConversationHistory(sessionId: string): ChatMessage[] {
    return this.conversationHistory.get(sessionId) || [];
  }

  /**
   * Réinitialise une session
   */
  resetSession(sessionId: string): void {
    this.conversationHistory.delete(sessionId);
    this.requestCounts.delete(sessionId);
  }
}
