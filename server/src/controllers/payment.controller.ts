import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import Stripe from "stripe";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import Order from "../models/order.model";

// Lazy-load Stripe instance to ensure environment variables are loaded
const getStripeInstance = () => {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    throw new ApiError(500, "Stripe API key not configured");
  }
  return new Stripe(apiKey);
};

// Create Payment Intent
const createPaymentIntent = asyncHandler(async (req: ExpressRequest, res: ExpressResponse) => {
  const { amount, currency, orderId, userId, email } = req.body;

  if (!amount || !currency) {
    throw new ApiError(400, "Amount and currency are required");
  }

  if (amount <= 0) {
    throw new ApiError(400, "Amount must be greater than 0");
  }

  const stripe = getStripeInstance();
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // convert to smallest currency unit
    currency: currency.toLowerCase(),
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      orderId: orderId || 'N/A',
      userId: userId || 'N/A',
      email: email || 'N/A',
    },
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
      "Payment intent created successfully"
    )
  );
});

// Confirm Payment (after client-side payment with Stripe token)
const confirmPayment = asyncHandler(async (req: ExpressRequest, res: ExpressResponse) => {
  const { paymentIntentId, orderId, stripeToken } = req.body;

  if (!paymentIntentId) {
    throw new ApiError(400, "Payment Intent ID is required");
  }

  const stripe = getStripeInstance();

  try {
    // If token is provided, confirm payment with it
    if (stripeToken) {
      console.log('Confirming payment with Stripe token:', stripeToken);

      // Confirm payment with the Stripe token
      const paymentIntent = await stripe.paymentIntents.confirm(
        paymentIntentId,
        {
          payment_method: stripeToken,
        }
      );

      console.log('Payment intent confirmed:', paymentIntent.status);

      if (paymentIntent.status === 'succeeded') {
        // Update order status in database
        if (orderId) {
          await Order.findByIdAndUpdate(
            orderId,
            {
              paymentStatus: 'completed',
              paymentIntentId: paymentIntentId,
              orderStatus: 'confirmed',
            },
            { new: true }
          );
        }

        res.status(200).json(
          new ApiResponse(
            200,
            { status: paymentIntent.status },
            "Payment confirmed successfully"
          )
        );
      } else if (paymentIntent.status === 'processing') {
        res.status(202).json(
          new ApiResponse(
            202,
            { status: paymentIntent.status },
            "Payment is processing"
          )
        );
      } else {
        throw new ApiError(402, "Payment failed");
      }
    } else {
      // Fallback: just check status if no token provided
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        // Update order status in database
        if (orderId) {
          await Order.findByIdAndUpdate(
            orderId,
            {
              paymentStatus: 'completed',
              paymentIntentId: paymentIntentId,
              orderStatus: 'confirmed',
            },
            { new: true }
          );
        }

        res.status(200).json(
          new ApiResponse(
            200,
            { status: paymentIntent.status },
            "Payment confirmed successfully"
          )
        );
      } else if (paymentIntent.status === 'processing') {
        res.status(202).json(
          new ApiResponse(
            202,
            { status: paymentIntent.status },
            "Payment is processing"
          )
        );
      } else if (paymentIntent.status === 'requires_payment_method') {
        throw new ApiError(402, "Payment method required");
      } else {
        throw new ApiError(402, "Payment failed");
      }
    }
  } catch (error: any) {
    console.error('Payment error:', error);
    const errorMsg = error.message || error.raw?.message || "Payment confirmation failed";
    console.error('Error details:', errorMsg);
    throw new ApiError(402, errorMsg);
  }
});

// Get Payment Status
const getPaymentStatus = asyncHandler(async (req: ExpressRequest, res: ExpressResponse) => {
  const { paymentIntentId } = req.params;

  if (!paymentIntentId) {
    throw new ApiError(400, "Payment Intent ID is required");
  }

  const stripe = getStripeInstance();
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      },
      "Payment status retrieved successfully"
    )
  );
});

export {
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus,
};
