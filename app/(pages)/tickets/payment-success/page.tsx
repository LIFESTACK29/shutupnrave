/**
 * Payment Success Page
 *
 * This page is displayed after a successful payment via Paystack.
 *
 * Features:
 * 1. Verifies payment status with Paystack when page loads
 * 2. Displays order details, ticket information, and pricing breakdown
 * 3. Shows loading state during payment verification
 * 4. Handles error states for failed payments
 * 5. Responsive design optimized for mobile and desktop
 * 6. Formats prices in Nigerian Naira (NGN)
 * 7. Provides navigation back to tickets or home page
 *
 * URL Pattern: /tickets/payment-success?reference=ORD-YYYY-XXXXXX
 * The reference parameter contains our custom order ID for verification
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyPayment } from "@/app/server/checkout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/app/components/Navbar";
import { Order, OrderItem } from "@/types";

export default function PaymentSuccessPage() {
  // State management for different stages of payment verification
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [order, setOrder] = useState<Order | null>(null); // Complete order data after verification
  const [errorMessage, setErrorMessage] = useState(""); // Error details for failed payments
  const router = useRouter();
  const searchParams = useSearchParams();

  // Main effect: Verify payment when component mounts
  useEffect(() => {
    // Extract order reference from URL parameters
    // This is our custom order ID passed back from Paystack
    const reference = searchParams.get("reference");

    if (!reference) {
      setStatus("error");
      setErrorMessage("No payment reference found");
      return;
    }

    /**
     * Handles the payment verification process
     * 1. Calls verifyPayment server action with reference
     * 2. Updates order status in database if successful
     * 3. Sends confirmation email with QR code
     * 4. Updates component state based on results
     */
    async function handlePaymentVerification() {
      try {
        // Call server action to verify payment with Paystack
        const result = await verifyPayment(reference!);

        if (result.success && result.order) {
          setOrder(result.order); // Store complete order data for display
          setStatus("success"); // Show success UI
        } else {
          setStatus("error");
          setErrorMessage(result.error || "Payment verification failed");
        }
      } catch (error) {
        console.log(error);
        setStatus("error");
        setErrorMessage("Something went wrong while verifying your payment");
      }
    }

    handlePaymentVerification();
  }, [searchParams]); // Re-run if URL parameters change

  /**
   * Formats price values to Nigerian Naira currency
   * Uses Intl.NumberFormat for proper currency formatting
   *
   * @param {number} price - Price in kobo (will be divided by 100 automatically)
   * @returns {string} Formatted currency string (e.g., "₦50")
   */
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN", // Nigerian Naira
      minimumFractionDigits: 0, // No decimal places for whole numbers
    }).format(price);
  };

  // Loading State: Show spinner while verifying payment
  if (status === "loading") {
    return (
      <div className="bg-black text-white min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-yellow-400 mb-2">
              Verifying Payment...
            </h2>
            <p className="text-white/70">
              Please wait while we confirm your payment
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="bg-black text-white min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <Card className="bg-white/5 border-red-500/50 max-w-md w-full">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-red-400 mb-4">
                Payment Failed
              </h2>
              <p className="text-white/70 mb-6">{errorMessage}</p>
              <div className="space-y-3">
                <Button
                  onClick={() => router.push("/tickets")}
                  className="w-full bg-yellow-400 text-black hover:bg-yellow-300"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => router.push("/")}
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-black text-white min-h-screen">
        <div className="flex items-center justify-center py-4 px-4 md:py-8">
          <Card className="bg-white/5 border-green-500/50 max-w-2xl w-full max-h-[85vh] md:max-h-[90vh] overflow-y-auto">
            <CardContent className="px-4 py-6 md:px-6 md:py-8">
              <div className="text-center mb-6 md:mb-8">
                <div className="text-4xl md:text-6xl mb-3 md:mb-4">🎉</div>
                <h2 className="text-2xl md:text-3xl font-bold text-green-400 mb-2">
                  Payment Successful!
                </h2>
                <p className="text-white/70 text-sm md:text-base px-2">
                  Your tickets have been confirmed and sent to your email
                </p>
              </div>

              {order && (
                <>
                  <div className="bg-yellow-400/10 border border-yellow-400/50 rounded-xl px-4 py-4 md:px-6 md:py-6 mb-4 md:mb-6">
                    <h3 className="text-lg md:text-xl font-bold text-yellow-400 mb-3 md:mb-4">
                      Order Details
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-start">
                        <span className="text-white/70">Order ID:</span>
                        <span className="text-white font-mono text-xs md:text-sm break-all ml-2">
                          {order.orderId}
                        </span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-white/70">Customer:</span>
                        <span className="text-white text-right ml-2">
                          {order.user.fullName}
                        </span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-white/70">Email:</span>
                        <span className="text-white text-right ml-2 break-all">
                          {order.user.email}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/20 rounded-xl px-4 py-4 md:px-6 md:py-6 mb-4 md:mb-6">
                    <h3 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4">
                      Ticket Information
                    </h3>
                    {order.orderItems.map((item: OrderItem, index: number) => (
                      <div
                        key={index}
                        className="flex justify-between items-start py-3 border-b border-white/10 last:border-b-0"
                      >
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm md:text-base">
                            {item.ticketType.name}
                          </p>
                          <p className="text-white/70 text-xs md:text-sm">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <p className="text-white font-bold text-sm md:text-base ml-2">
                          {formatPrice(item.totalPrice)}
                        </p>
                      </div>
                    ))}

                    <div className="border-t border-yellow-400/30 mt-4 pt-4">
                      <div className="flex justify-between text-xs md:text-sm mb-2">
                        <span className="text-white/70">Subtotal:</span>
                        <span className="text-white">
                          {formatPrice(order.subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs md:text-sm mb-2">
                        <span className="text-white/70">Processing Fee:</span>
                        <span className="text-white">
                          {formatPrice(order.processingFee)}
                        </span>
                      </div>
                      <div className="flex justify-between text-base md:text-lg font-bold">
                        <span className="text-white">Total Paid:</span>
                        <span className="text-yellow-400">
                          {formatPrice(order.total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/50 rounded-xl px-4 py-4 md:px-6 md:py-6 mb-4 md:mb-6">
                    <h3 className="text-base md:text-lg font-bold text-blue-400 mb-3">
                      📧 Check Your Email
                    </h3>
                    <p className="text-white/70 text-xs md:text-sm">
                      We&apos;ve sent a confirmation email to{" "}
                      <span className="text-white font-medium break-all">
                        {order.user.email}
                      </span>{" "}
                      with your ticket details and event information.
                    </p>
                  </div>
                </>
              )}

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-6 md:mt-8">
                <Button
                  onClick={() => router.push("/")}
                  className="flex-1 bg-yellow-400 text-black hover:bg-yellow-300 cursor-pointer h-12 text-sm md:text-base"
                >
                  Back to Home
                </Button>
                <Button
                  onClick={() => router.push("/tickets")}
                  className="flex-1 bg-yellow-400 text-black hover:bg-yellow-300 cursor-pointer h-12 text-sm md:text-base"
                >
                  Buy More Tickets
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
