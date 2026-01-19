import { Request, Response, NextFunction } from 'express';
import { verifyIdToken } from '../config/firebase';

// Request'e user eklemek için tip genişletme
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
        name?: string;
      };
    }
  }
}

// Firebase token doğrulama middleware
export async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Authorization header'ı al
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token bulunamadı',
      });
    }

    // Token'ı ayıkla
    const token = authHeader.split('Bearer ')[1];

    // Token'ı doğrula
    const decodedToken = await verifyIdToken(token);

    // Kullanıcı bilgilerini request'e ekle
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
    };

    next();
  } catch (error) {
    console.error('Auth middleware hatası:', error);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Geçersiz token',
    });
  }
}

// Optional auth - Token yoksa da devam et
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await verifyIdToken(token);

      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
      };
    }

    next();
  } catch (error) {
    // Hata olsa bile devam et
    next();
  }
}
