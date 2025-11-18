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

// Confirm Payment (after client-side payment)
const confirmPayment = asyncHandler(async (req: ExpressRequest, res: ExpressResponse) => {
  const { paymentIntentId, orderId, cardNumber, cardExpiry, cardCvc } = req.body;

  if (!paymentIntentId) {
    throw new ApiError(400, "Payment Intent ID is required");
  }

  // Validate card details if provided
  if (cardNumber || cardExpiry || cardCvc) {
    if (!cardNumber || !cardExpiry || !cardCvc) {
      throw new ApiError(400, "All card details (number, expiry, CVC) are required");
    }

    // Validate card number format (basic check)
    const cardNumCleaned = cardNumber.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cardNumCleaned)) {
      throw new ApiError(400, "Invalid card number");
    }

    // Validate expiry format MM/YY
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      throw new ApiError(400, "Invalid expiry date format. Use MM/YY");
    }

    // Validate CVC format
    if (!/^\d{3,4}$/.test(cardCvc)) {
      throw new ApiError(400, "Invalid CVC");
    }

    // Parse expiry date
    const [month, year] = cardExpiry.split('/');
    const expMonth = parseInt(month, 10);
    const expYear = parseInt('20' + year, 10);

    // Validate expiry date
    if (expMonth < 1 || expMonth > 12) {
      throw new ApiError(400, "Invalid expiry month");
    }

    const stripe = getStripeInstance();

    try {
      // First, create a payment method from card details
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: cardNumCleaned,
          exp_month: expMonth,
          exp_year: expYear,
          cvc: cardCvc,
        },
      });

      // Then confirm payment with the payment method ID
      const paymentIntent = await stripe.paymentIntents.confirm(
        paymentIntentId,
        {
          payment_method: paymentMethod.id,
        }
      );

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
    } catch (error: any) {
      throw new ApiError(402, error.message || "Payment confirmation failed");
    }
  } else {
    // Fallback: just check status (for backward compatibility)
    const stripe = getStripeInstance();
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
