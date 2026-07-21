import { AuthenticateUserUseCase } from '../../core/usecases/AuthenticateUserUseCase';
import { ConnectTelegramManualUseCase } from '../../core/usecases/ConnectTelegramManualUseCase';
import { Request, Response } from 'express';

export class AuthController {
  constructor(
    private authUseCase: AuthenticateUserUseCase,
    private connectManualUseCase: ConnectTelegramManualUseCase
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

  handleTelegramManual = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, firstName, lastName } = req.body;
      const result = await this.connectManualUseCase.execute({ username, firstName, lastName });
      res.json(result);
    } catch (err: any) {
      console.error('[AuthController] Error in handleTelegramManual:', err);
      res.status(400).json({ error: err.message || 'Gagal menghubungkan secara manual.' });
    }
  }
}
