/**
 * User Model and Storage
 * Manages user data with secure password hashing using bcrypt
 * Uses PostgreSQL database via TypeORM
 */

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { User } from '../@types/auth/Auth';
import config from '../config/config';
import { AppDataSource } from '../config/database';
import { UserEntity } from './UserEntity';
import { i18n } from '../i18n/i18n';
import { Repository } from 'typeorm';

/**
 * PostgreSQL-based user storage using TypeORM
 */
class UserStore {
  private get userRepository(): Repository<UserEntity> {
    return AppDataSource.getRepository(UserEntity);
  }

  /**
   * Create a new user with securely hashed password
   */
  async create(email: string, password: string, username: string): Promise<User> {
    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw {
        statusCode: 409,
        message: i18n.__('errors.email_already_registered'),
      };
    }

    // Hash password using bcrypt
    const hashedPassword = await bcrypt.hash(password, config.bcrypt.saltRounds);

    const userId = crypto.randomUUID();

    const user = this.userRepository.create({
      id: userId,
      email: email.toLowerCase(),
      password: hashedPassword,
      username,
      roles: ['user'],
    });

    await this.userRepository.save(user);

    return user;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  /**
   * Verify password against hashed password
   */
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Get all users (excluding passwords) - for development/testing only
   */
  async getAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.userRepository.find();
    return users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  /**
   * Clear all users (for testing)
   */
  async clear(): Promise<void> {
    await this.userRepository.clear();
  }
}

// Export singleton instance
export const userStore = new UserStore();

export default userStore;
