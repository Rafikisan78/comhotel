import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { CreateUserDto, UserRole } from '../../users/dto/create-user.dto';

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
});
