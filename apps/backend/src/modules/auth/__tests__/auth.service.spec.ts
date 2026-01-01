import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { CreateUserDto, UserRole } from '../../users/dto/create-user.dto';
import { HashUtil } from '../../../common/utils/hash.util';

// Mock HashUtil
jest.mock('../../../common/utils/hash.util');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock_jwt_token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('devrait enregistrer un nouvel utilisateur avec succès', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.GUEST,
      };

      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.GUEST,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(usersService, 'create').mockResolvedValue(mockUser);

      const result = await service.register(createUserDto);

      expect(result).toBeDefined();
      expect(result.user).toEqual(mockUser);
      expect(result.accessToken).toBe('mock_jwt_token');
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('devrait lever une BadRequestException si l\'email est manquant', async () => {
      const createUserDto: any = {
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      await expect(service.register(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('devrait lever une BadRequestException si le mot de passe est manquant', async () => {
      const createUserDto: any = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      await expect(service.register(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('devrait lever une BadRequestException si le prénom est manquant', async () => {
      const createUserDto: any = {
        email: 'test@example.com',
        password: 'password123',
        lastName: 'Doe',
      };

      await expect(service.register(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('devrait lever une BadRequestException si le nom est manquant', async () => {
      const createUserDto: any = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
      };

      await expect(service.register(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('devrait générer un token JWT avec l\'id et l\'email de l\'utilisateur', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.GUEST,
      };

      const mockUser = {
        id: '123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.GUEST,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(usersService, 'create').mockResolvedValue(mockUser);

      await service.register(createUserDto);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: '123',
        email: 'test@example.com',
      });
    });
  });

  describe('login', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      password: '$2b$10$hashedPasswordExample',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.GUEST,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('devrait connecter un utilisateur avec les bons identifiants', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
      (HashUtil.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'test@example.com',
        password: 'correctPassword',
      });

      expect(result).toBeDefined();
      expect(result.user.email).toBe(mockUser.email);
      expect(result.user.id).toBe(mockUser.id);
      expect((result.user as any).password).toBeUndefined(); // Password ne doit PAS être retourné
      expect(result.accessToken).toBe('mock_jwt_token');
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(HashUtil.compare).toHaveBeenCalledWith(
        'correctPassword',
        '$2b$10$hashedPasswordExample',
      );
    });

    it('devrait lever une UnauthorizedException avec un mauvais mot de passe', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
      (HashUtil.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'wrongPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(HashUtil.compare).toHaveBeenCalledWith(
        'wrongPassword',
        '$2b$10$hashedPasswordExample',
      );
    });

    it('devrait lever une UnauthorizedException avec un email inexistant', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      await expect(
        service.login({
          email: 'nonexistent@example.com',
          password: 'anyPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(usersService.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
      expect(HashUtil.compare).not.toHaveBeenCalled();
    });

    it('devrait lever une UnauthorizedException avec un mot de passe vide', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
      (HashUtil.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({
          email: 'test@example.com',
          password: '',
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(HashUtil.compare).toHaveBeenCalledWith(
        '',
        '$2b$10$hashedPasswordExample',
      );
    });

    it('devrait générer un JWT avec userId et email après login réussi', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
      (HashUtil.compare as jest.Mock).mockResolvedValue(true);

      await service.login({
        email: 'test@example.com',
        password: 'correctPassword',
      });

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-123',
        email: 'test@example.com',
      });
    });

    it('ne devrait PAS appeler HashUtil.compare si utilisateur inexistant', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      await expect(
        service.login({
          email: 'nonexistent@example.com',
          password: 'anyPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(HashUtil.compare).not.toHaveBeenCalled();
    });

    it('devrait lever une UnauthorizedException si user.password est undefined', async () => {
      const userWithoutPassword = { ...mockUser, password: undefined };
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(userWithoutPassword);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'anyPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(HashUtil.compare).not.toHaveBeenCalled();
    });
  });
});
