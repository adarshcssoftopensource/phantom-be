import { METHOD_TO_PERMISSION, PERMISSIONS_MAP } from '@common/constants';
import { IS_PUBLIC_KEY } from '@common/decorators/public.decorator';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/user/schema/user.model';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Allow access to public routes
    }

    const userId = request.user?.id;

    if (!userId) return false;

    const user = await this.userModel.findById(userId);

    if (!user) return false;

    const requiredPermission = METHOD_TO_PERMISSION[request.method];

    const userPermissions = PERMISSIONS_MAP[user.permissionLevel] || [];

    if (!userPermissions.includes(requiredPermission)) {
      throw new ForbiddenException(
        `You do not have permission to ${requiredPermission} this resource`,
      );
    }

    return true;
  }
}
