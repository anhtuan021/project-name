import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose from 'mongoose';
import { comparePasswordHelper } from '../helpers/util';
import { User } from '../modules/users/schemas/user.schema';
import { UsersService } from './../modules/users/users.service';
import { AuthService } from './auth.service';

describe('AuthService - Login', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let userModel;

  beforeAll(async () => {
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/',
    );
    userModel = mongoose.model(User.name, new mongoose.Schema(User));
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        JwtModule.register({
          secret: process.env.JWT_SECRET || 'testSecretKey',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      providers: [
        AuthService,
        UsersService,
        { provide: getModelToken(User.name), useValue: userModel },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should verify login with ID, email, and password from MongoDB', async () => {
    const email = 'afc1@email.com';
    const plainPassword = '123456';

    const userFromDB = await usersService.findByEmail(email);

    console.log({ userFromDB, email: userFromDB?.email, id: userFromDB?._id });

    expect(userFromDB).not.toBeNull();
    expect(userFromDB?.email).toBe(email);
    expect(mongoose.isValidObjectId(userFromDB?._id)).toBe(true);

    const isPasswordValid = await comparePasswordHelper(
      plainPassword,
      userFromDB?.password ?? '',
    );
    expect(isPasswordValid).toBe(true);

    const result = await authService.signIn(email, plainPassword);
    expect(result).not.toBeNull();
    expect(result).toHaveProperty('access_token');
    expect(typeof result?.access_token).toBe('string');
  }, 10000); // Tăng timeout lên 10 giây để tránh lỗi timeout
});
