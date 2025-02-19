import { Roles } from '@common/decorators/roles.decorator';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserDocument } from 'src/user/schema/user.model';
import { ROLE } from 'src/user/user.role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());

    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: UserDocument = request.user;

    return matchRoles(roles, user.role);
  }
}

function matchRoles(roles: Array<ROLE>, role: ROLE) {
  return roles.includes(role);
}
