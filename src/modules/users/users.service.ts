import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import dayjs from 'dayjs';
import mongoose, { Model } from 'mongoose';
import { ChangePasswordAuthDto, CodeAuthDto, CreateAuthDto } from 'src/auth/dto/create-auth.dto';
import { v4 as uuidv4 } from 'uuid';
import { hashPasswordHelper } from '../../helpers/util';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly mailerService: MailerService,
  ) {}
  isEmailExist = async (email: string) => {
    const user = await this.userModel.exists({ email });
    if (user) return true;
    return false;
  };
  async create(createUserDto: CreateUserDto) {
    const { name, email, password, phone, address, image } = createUserDto;
    const isExist = await this.isEmailExist(email);
    if (isExist === true) {
      throw new BadRequestException(
        `email đã tồn tại: ${email}. Vui lòng sử dụng email khác.`,
      );
    }
    const hashPassword = await hashPasswordHelper(password);
    const user = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      phone,
      address,
      image,
    });
    return {
      _id: user._id,
    };
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);
    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;
    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;
    const results = await this.userModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .select('-password')
      .sort(sort as any);
    return {
      meta: {
        current: current,
        pageSize: pageSize,
        pages: totalPages,
        total: totalItems,
      },
      results,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async findByEmail(email: string) {
    const filter = {
      email: email,
    };

    const retVal = await this.userModel.findOne(filter);
    //console.log(email, retVal, filter);

    return retVal?.toObject();
  }
  async update(updateUserDto: UpdateUserDto) {
    return await this.userModel.updateOne(
      { _id: updateUserDto._id },
      { ...updateUserDto },
    );
  }

  async remove(_id: string) {
    if (mongoose.isValidObjectId(_id)) {
      return this.userModel.deleteOne({ _id });
    } else {
      throw new BadRequestException('Id không đúng định dạng mongodb');
    }
  }
  async handleRegister(registerDto: CreateAuthDto) {
    const { name, email, password } = registerDto;
    const isExist = await this.isEmailExist(email);
    if (isExist === true) {
      throw new BadRequestException(
        `email đã tồn tại: ${email}. Vui lòng sử dụng email khác.`,
      );
    }
    const hashPassword = await hashPasswordHelper(password);
    const codeId = uuidv4();
    const user = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      isActive: false,
      codeId: codeId,
      codeExpired: dayjs().add(5, 'minutes'),
    });
    this.mailerService.sendMail({
      to: user.email, // list of receivers
      subject: 'Activated your account at @Tuan', // Subject line
      template: 'register',
      context: {
        name: user?.name ?? user.email,
        activationCode: codeId,
      },
    });
    return {
      _id: user._id,
    };
  }
  async handleActive(data: CodeAuthDto){
    const user = await this.userModel.findOne({
      _id: data._id,
      codeId: data.code,
    });
    if (!user) {
      throw new BadRequestException("Mã code không hợp lệ hoặc đã hết hạn")
    }
    const isBeforeCheck = dayjs().isBefore(user.codeExpired);
    if (isBeforeCheck) {
      await this.userModel.updateOne(
        { _id: data._id },
        {
          isActive: true,
        },
      );
      return { isBeforeCheck };
    } else {
      throw new BadRequestException("Mã code không hợp lệ hoặc đã hết hạn")
    }
  }
  async retryActive(email: string) {
    const user = await this.userModel.findOne({email});
    if(!user){
      throw new BadRequestException("Tai khoan khong ton tai")
    }
    if(user.isActive){
      throw new BadRequestException("tai khoan da duoc kich hoat")
    }
    const codeId = uuidv4();
    await user.updateOne({
      codeId: codeId,
      codeExpired: dayjs().add(5, 'minutes')
    })
    this.mailerService.sendMail({
      to: user.email, // list of receivers
      subject: 'Activated your account at @Tuan', // Subject line
      template: 'register',
      context: {
        name: user?.name ?? user.email,
        activationCode: codeId,
      },
    })
    return { _id: user._id };
  }
  async retryPassword(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException("Tai khoan khong ton tai")
    }

    const codeId = uuidv4();
    await user.updateOne({
      codeId: codeId,
      codeExpired: dayjs().add(5, 'minutes')
    })
    this.mailerService.sendMail({
      to: user.email, // list of receivers
      subject: 'Change your password at @Tuan', // Subject line
      template: 'register',
      context: {
        name: user?.name ?? user.email,
        activationCode: codeId,
      },
    })
    return { _id: user._id, email: user.email };
  }
  async changePassword(data: ChangePasswordAuthDto) {
    if (data.confirmPassword !== data.password) {
      throw new BadRequestException("mat khau/ xac nhan mat khau khong chinh xac")
    }
    const user = await this.userModel.findOne({ email: data.email });
    if (!user) {
      throw new BadRequestException("Tai khoan khong ton tai")
    }
    const isBeforeCheck = dayjs().isBefore(user.codeExpired);
    if (isBeforeCheck) {
      const newPassword = await hashPasswordHelper(data.password)
      await user.updateOne({ password: newPassword })
      return { isBeforeCheck };
    } else {
      throw new BadRequestException("Mã code không hợp lệ hoặc đã hết hạn")
    };
  }
}
