import * as argon2 from 'argon2';
import { UserRepository } from '../repositories/user-repository';
import { RegisterInput, LoginInput } from '../schemas/auth';
import { User } from '@prisma/client';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(input: RegisterInput): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      if (existingUser.passwordHash) {
        throw new Error('User with this email already exists');
      }
      
      const passwordHash = await argon2.hash(input.password);
      return this.userRepository.updateProfile(existingUser.id, {
        fullName: input.name,
        passwordHash,
        emailVerified: true,
      });
    }

    const passwordHash = await argon2.hash(input.password);

    return this.userRepository.create({
      email: input.email,
      fullName: input.name,
      passwordHash,
    });
  }

  async validateCredentials(input: LoginInput): Promise<User | null> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user || !user.passwordHash) {
      return null;
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, input.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }
}
