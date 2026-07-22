import { AuthenticateUserUseCase } from '../../core/usecases/AuthenticateUserUseCase';
import { Request, Response } from 'express';

export class AuthController {
  constructor(
    private authUseCase: AuthenticateUserUseCase
  ) {}

  handleTelegramAuth = async (req: Request, res: Response): Promise<void> => {
    try {
      const { initData } = req.body;
      const result = await this.authUseCase.execute(initData);
      res.json(result);
    } catch (err: any) {
      console.error('[AuthController] Error in handleTelegramAuth:', err);
      res.status(400).json({ error: err.message || 'Gagal melakukan otentikasi.' });
    }
  }
}
