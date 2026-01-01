import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users.service';
import { CreateUserDto, UserRole } from '../dto/create-user.dto';
import { HashUtil } from '../../../common/utils/hash.util';

// Mock HashUtil
jest.mock('../../../common/utils/hash.util');

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);

    // Reset mock
    jest.clearAllMocks();
    (HashUtil.hash as jest.Mock).mockResolvedValue('hashed_password');
  });

  describe('create', () => {
    it('devrait créer un nouvel utilisateur avec succès', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = await service.create(createUserDto);

      expect(result).toBeDefined();
      expect(result.email).toBe(createUserDto.email);
      expect(result.firstName).toBe(createUserDto.firstName);
      expect(result.lastName).toBe(createUserDto.lastName);
      expect(result.role).toBe('guest');
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.password).toBeUndefined(); // Le mot de passe ne doit pas être retourné
    });

    it('devrait hasher le mot de passe avant de créer l\'utilisateur', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      await service.create(createUserDto);

      expect(HashUtil.hash).toHaveBeenCalledWith('password123');
    });

    it('devrait lever une ConflictException si l\'email existe déjà', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      await service.create(createUserDto);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('devrait lever une BadRequestException si le mot de passe est trop court', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'short',
        firstName: 'John',
        lastName: 'Doe',
      };

      await expect(service.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('devrait définir le rôle par défaut à "guest" si non spécifié', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const result = await service.create(createUserDto);

      expect(result.role).toBe('guest');
    });
  });

  describe('findByEmail', () => {
    it('devrait trouver un utilisateur par email', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      await service.create(createUserDto);
      const result = await service.findByEmail('test@example.com');

      expect(result).toBeDefined();
      expect(result?.email).toBe('test@example.com');
    });

    it('devrait retourner null si l\'utilisateur n\'existe pas', async () => {
      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });
});
