import express, { Request, Response } from 'express';
import { optionalAuth } from '../middleware/auth';
import { interpretDream, getDreamHistory, saveDream, deleteDream } from '../services/dreamInterpreter';

const router = express.Router();

// POST /api/dreams/interpret - Rüya yorumlama
router.post('/interpret', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { dreamText } = req.body;

    if (!dreamText || dreamText.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Rüya metni boş olamaz',
      });
    }

    // Rüyayı yorumla
    const result = await interpretDream(dreamText, req.user?.uid);

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Rüya yorumlama hatası:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Rüya yorumlanırken bir hata oluştu',
    });
  }
});

// GET /api/dreams/history - Kullanıcının rüya geçmişi
router.get('/history', optionalAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || 'anonymous';
    const dreams = await getDreamHistory(userId);

    return res.status(200).json({ dreams });
  } catch (error: any) {
    console.error('Geçmiş getirme hatası:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Geçmiş getirilirken bir hata oluştu',
    });
  }
});

// POST /api/dreams/save - Rüya kaydetme
router.post('/save', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { dreamText, interpretation, energy, symbols } = req.body;
    const userId = req.user?.uid || 'anonymous';

    if (!dreamText || !interpretation) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Rüya metni ve yorum gerekli',
      });
    }

    const savedDream = await saveDream({
      userId,
      dreamText,
      interpretation,
      energy: energy || 50,
      symbols: symbols || [],
    });

    return res.status(201).json(savedDream);
  } catch (error: any) {
    console.error('Rüya kaydetme hatası:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Rüya kaydedilirken bir hata oluştu',
    });
  }
});

// DELETE /api/dreams/:id - Rüya silme
router.delete('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid || 'anonymous';

    await deleteDream(id, userId);

    return res.status(200).json({
      message: 'Rüya silindi',
    });
  } catch (error: any) {
    console.error('Rüya silme hatası:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Rüya silinirken bir hata oluştu',
    });
  }
});

export default router;
