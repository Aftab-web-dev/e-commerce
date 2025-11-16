import { Router } from 'express';
import {
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus,
} from '../controllers/payment.controller';
import { verifyJWT } from '../middlewares/auth.middleware';

const router = Router();

// Create payment intent (protected route)
router.post('/create-intent', verifyJWT, createPaymentIntent);

// Confirm payment after successful client-side payment (protected route)
router.post('/confirm', verifyJWT, confirmPayment);

// Get payment status (protected route)
router.get('/status/:paymentIntentId', verifyJWT, getPaymentStatus);

export default router;
