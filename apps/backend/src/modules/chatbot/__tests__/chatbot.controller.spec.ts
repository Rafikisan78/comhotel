import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ChatbotController } from '../chatbot.controller';
import { ChatbotService } from '../chatbot.service';

/**
 * Tests unitaires pour le ChatbotController
 *
 * Vérifie la validation des entrées au niveau du contrôleur
 */

describe('ChatbotController', () => {
  let controller: ChatbotController;
  let mockChatbotService: any;

  beforeEach(async () => {
    mockChatbotService = {
      processMessage: jest.fn().mockResolvedValue({
        type: 'hotel_list',
        message: 'Test response',
        data: { hotels: [] },
        securityInfo: { inputSanitized: true, riskLevel: 'low' },
      }),
      getConversationHistory: jest.fn().mockReturnValue([]),
      resetSession: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatbotController],
      providers: [
        { provide: ChatbotService, useValue: mockChatbotService },
      ],
    }).compile();

    controller = module.get<ChatbotController>(ChatbotController);
  });

  describe('POST /chatbot/message', () => {
    const mockRequest = {
      headers: {},
      ip: '127.0.0.1',
      socket: { remoteAddress: '127.0.0.1' },
    } as any;

    it('should process valid message', async () => {
      const result = await controller.sendMessage(
        { message: 'Hôtels à Paris', sessionId: 'valid-session-123' },
        mockRequest
      );

      expect(result).toBeDefined();
      expect(mockChatbotService.processMessage).toHaveBeenCalledWith(
        'valid-session-123',
        'Hôtels à Paris',
        '127.0.0.1'
      );
    });

    it('should reject empty message', async () => {
      await expect(
        controller.sendMessage({ message: '', sessionId: 'session-123' }, mockRequest)
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject null message', async () => {
      await expect(
        controller.sendMessage({ message: null as any, sessionId: 'session-123' }, mockRequest)
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject missing sessionId', async () => {
      await expect(
        controller.sendMessage({ message: 'Test', sessionId: '' }, mockRequest)
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid sessionId format (too short)', async () => {
      await expect(
        controller.sendMessage({ message: 'Test', sessionId: 'abc' }, mockRequest)
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid sessionId format (special chars)', async () => {
      await expect(
        controller.sendMessage({ message: 'Test', sessionId: 'session<script>' }, mockRequest)
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject invalid sessionId format (SQL injection)', async () => {
      await expect(
        controller.sendMessage({ message: 'Test', sessionId: "session'; DROP TABLE--" }, mockRequest)
      ).rejects.toThrow(BadRequestException);
    });

    it('should accept valid UUID sessionId', async () => {
      const result = await controller.sendMessage(
        { message: 'Test', sessionId: '550e8400-e29b-41d4-a716-446655440000' },
        mockRequest
      );

      expect(result).toBeDefined();
    });

    it('should accept valid alphanumeric sessionId', async () => {
      const result = await controller.sendMessage(
        { message: 'Test', sessionId: 'abc123def456ghi789' },
        mockRequest
      );

      expect(result).toBeDefined();
    });

    it('should extract client IP from X-Forwarded-For header', async () => {
      const requestWithForwarded = {
        ...mockRequest,
        headers: { 'x-forwarded-for': '192.168.1.1, 10.0.0.1' },
      };

      await controller.sendMessage(
        { message: 'Test', sessionId: 'session-12345678' },
        requestWithForwarded
      );

      expect(mockChatbotService.processMessage).toHaveBeenCalledWith(
        'session-12345678',
        'Test',
        '192.168.1.1'
      );
    });
  });

  describe('GET /chatbot/history/:sessionId', () => {
    it('should return history for valid sessionId', () => {
      const result = controller.getHistory('valid-session-123');

      expect(result).toBeDefined();
      expect(result.sessionId).toBe('valid-session-123');
      expect(mockChatbotService.getConversationHistory).toHaveBeenCalledWith('valid-session-123');
    });

    it('should reject invalid sessionId format', () => {
      expect(() => controller.getHistory('bad<id>')).toThrow(BadRequestException);
    });

    it('should reject sessionId that is too short', () => {
      expect(() => controller.getHistory('short')).toThrow(BadRequestException);
    });
  });

  describe('DELETE /chatbot/session/:sessionId', () => {
    it('should reset valid session', () => {
      controller.resetSession('valid-session-123');

      expect(mockChatbotService.resetSession).toHaveBeenCalledWith('valid-session-123');
    });

    it('should reject invalid sessionId format', () => {
      expect(() => controller.resetSession('invalid;session')).toThrow(BadRequestException);
    });
  });

  describe('GET /chatbot/health', () => {
    it('should return health status', () => {
      const result = controller.health();

      expect(result.status).toBe('ok');
      expect(result.service).toBe('chatbot');
      expect(result.security.owasp).toBeDefined();
      expect(result.security.mitre).toBeDefined();
    });
  });
});

describe('ChatbotController - Input Validation Edge Cases', () => {
  let controller: ChatbotController;
  let mockChatbotService: any;

  beforeEach(async () => {
    mockChatbotService = {
      processMessage: jest.fn().mockResolvedValue({
        type: 'hotel_list',
        message: 'Response',
        data: {},
      }),
      getConversationHistory: jest.fn().mockReturnValue([]),
      resetSession: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatbotController],
      providers: [
        { provide: ChatbotService, useValue: mockChatbotService },
      ],
    }).compile();

    controller = module.get<ChatbotController>(ChatbotController);
  });

  const mockRequest = {
    headers: {},
    ip: '127.0.0.1',
    socket: { remoteAddress: '127.0.0.1' },
  } as any;

  describe('Message content validation', () => {
    it('should pass through whitespace-only message to service for handling', async () => {
      // Le contrôleur passe le message, le service gère les espaces vides
      const result = await controller.sendMessage(
        { message: '   ', sessionId: 'session-12345678' },
        mockRequest
      );
      // Le service retourne une réponse d'aide pour les messages vides/whitespace
      expect(result).toBeDefined();
    });

    it('should pass through non-empty message to service', async () => {
      await controller.sendMessage(
        { message: '  Hôtels à Paris  ', sessionId: 'session-12345678' },
        mockRequest
      );

      expect(mockChatbotService.processMessage).toHaveBeenCalledWith(
        'session-12345678',
        '  Hôtels à Paris  ',
        '127.0.0.1'
      );
    });
  });

  describe('SessionId boundary validation', () => {
    it('should accept sessionId at minimum length (8 chars)', async () => {
      await controller.sendMessage(
        { message: 'Test', sessionId: '12345678' },
        mockRequest
      );

      expect(mockChatbotService.processMessage).toHaveBeenCalled();
    });

    it('should accept sessionId at maximum length (64 chars)', async () => {
      const longSessionId = 'a'.repeat(64);

      await controller.sendMessage(
        { message: 'Test', sessionId: longSessionId },
        mockRequest
      );

      expect(mockChatbotService.processMessage).toHaveBeenCalled();
    });

    it('should reject sessionId exceeding maximum length', async () => {
      const tooLongSessionId = 'a'.repeat(65);

      await expect(
        controller.sendMessage({ message: 'Test', sessionId: tooLongSessionId }, mockRequest)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Type validation', () => {
    it('should reject non-string message type', async () => {
      await expect(
        controller.sendMessage({ message: 123 as any, sessionId: 'session-123' }, mockRequest)
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject non-string sessionId type', async () => {
      await expect(
        controller.sendMessage({ message: 'Test', sessionId: 123 as any }, mockRequest)
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject array message', async () => {
      await expect(
        controller.sendMessage({ message: ['test'] as any, sessionId: 'session-123' }, mockRequest)
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject object message', async () => {
      await expect(
        controller.sendMessage({ message: { text: 'test' } as any, sessionId: 'session-123' }, mockRequest)
      ).rejects.toThrow(BadRequestException);
    });
  });
});
