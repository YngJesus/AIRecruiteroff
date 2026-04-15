import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const roles = Reflect.getMetadata('roles', ctx.getHandler());
    if (!roles) return true; // No roles required, public endpoint

    const user = ctx.switchToHttp().getRequest().user;
    return roles.includes(user.role);
  }
}
