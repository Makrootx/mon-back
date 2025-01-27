import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

export class AuthGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const token = AuthGuard.extractTokenFromRequest(req);

    if (!token) throw new UnauthorizedException();

    const userPayload: any = jwt.verify(token, process.env.JWT_PASS);

    req.user = userPayload;
    return true;
  }

  static extractTokenFromRequest(req: Request) {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
