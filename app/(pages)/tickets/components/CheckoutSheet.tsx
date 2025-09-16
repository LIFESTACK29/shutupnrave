"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { initializePayment } from "@/app/server/checkout";

// Form validation schema
const checkoutFormSchema = z.object({
  fullName: z.string().min(4, "Full name must be at least 4 characters"),
  phone: z
    .string()
    .min(11, "Phone number must be at least 11 digits")
    .max(11, "Phone number must be maximum 11 digits"),
  email: z.string().email("Please enter a valid email address"),
});

type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

interface CheckoutSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  disabled: boolean;
  ticketInfo: {
    name: string;
    quantity: number;
    subtotal: number;
    processingFee: number;
    total: number;
  };
  formatPrice: (price: number) => string;
}

export default function CheckoutSheet({
  isOpen,
  onOpenChange,
  disabled,
  ticketInfo,
  formatPrice,
}: CheckoutSheetProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const searchParams = useSearchParams();

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
    },
  });

  const onSubmit = async (data: CheckoutFormData) => {
    setIsProcessing(true);
    setProcessingMessage("Setting up your payment...");

    try {
      const affiliateRef = searchParams?.get("ref") || undefined;
      // Initialize payment with Paystack
      const result = await initializePayment(
        {
          fullName: data.fullName,
          phone: data.phone,
          email: data.email,
        },
        {
          ticketType: ticketInfo.name,
          quantity: ticketInfo.quantity,
          subtotal: ticketInfo.subtotal,
          processingFee: ticketInfo.processingFee,
          total: ticketInfo.total,
        },
        affiliateRef
      );

      if (result.success) {
        setProcessingMessage("Redirecting to payment...");

        // Close the sheet
        onOpenChange(false);
        form.reset();
        // Redirect to Paystack payment page
        window.location.href = result.data?.paymentUrl || "";
      } else {
        throw new Error(result.error || "Payment initialization failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setProcessingMessage("");
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          disabled={disabled}
          className="w-full bg-yellow-400 text-black hover:bg-yellow-300 font-semibold py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:cursor-pointer active:scale-95 transition-transform duration-200"
        >
          {disabled ? "Select Quantity" : "Get Your Tickets Now"}
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-black border-l border-white/20 text-white w-full sm:max-w-md overflow-y-auto px-6">
        <SheetHeader className="space-y-4">
          <SheetTitle className="text-yellow-400 text-xl">
            Complete Your Purchase
          </SheetTitle>
          <SheetDescription className="text-white/70">
            Enter your details to secure your tickets for shutupnraveee 2025!
          </SheetDescription>
        </SheetHeader>

        {/* Order Summary in Sheet */}
        <div className="bg-yellow-400/10 border border-yellow-400/50 rounded-xl p-5 space-y-3 my-6">
          <h4 className="font-bold text-yellow-400 mb-3 text-lg">
            Order Summary
          </h4>
          <div className="flex justify-between text-sm">
            <span className="text-white/70">
              {ticketInfo.name} × {ticketInfo.quantity}
            </span>
            <span className="text-white font-medium">
              {formatPrice(ticketInfo.subtotal)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/70">Processing Fee (5%)</span>
            <span className="text-white font-medium">
              {formatPrice(ticketInfo.processingFee)}
            </span>
          </div>
          <Separator className="bg-yellow-400/30 my-3" />
          <div className="flex justify-between font-bold text-lg">
            <span className="text-white">Total</span>
            <span className="text-yellow-400">
              {formatPrice(ticketInfo.total)}
            </span>
          </div>
        </div>

        {/* Checkout Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-yellow-400 font-medium text-sm">
                    Full Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      {...field}
                      disabled={isProcessing}
                      className="bg-black border-2 border-white/20 text-white placeholder-white/40 focus:border-yellow-400 focus:ring-0 focus:ring-offset-0 rounded-lg h-12 transition-all duration-200 hover:border-white/30 disabled:opacity-50"
                    />
                  </FormControl>
                  <FormMessage className="text-xs font-medium" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-yellow-400 font-medium text-sm">
                    Phone Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="08012345678"
                      {...field}
                      disabled={isProcessing}
                      className="bg-black border-2 border-white/20 text-white placeholder-white/40 focus:border-yellow-400 focus:ring-0 focus:ring-offset-0 rounded-lg h-12 transition-all duration-200 hover:border-white/30 disabled:opacity-50"
                    />
                  </FormControl>
                  <FormMessage className="text-xs font-medium" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-yellow-400 font-medium text-sm">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      {...field}
                      disabled={isProcessing}
                      className="bg-black border-2 border-white/20 text-white placeholder-white/40 focus:border-yellow-400 focus:ring-0 focus:ring-offset-0 rounded-lg h-12 transition-all duration-200 hover:border-white/30 disabled:opacity-50"
                    />
                  </FormControl>
                  <FormMessage className="text-xs font-medium" />
                </FormItem>
              )}
            />

            <div className="pt-6 space-y-4">
              <Button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-yellow-400 text-black hover:bg-yellow-500 font-bold py-4 text-lg rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-yellow-400/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                    {processingMessage || "Processing..."}
                  </div>
                ) : (
                  `Pay ${formatPrice(ticketInfo.total)} - Secure Payment`
                )}
              </Button>

              <div className="text-center pt-2 pb-5">
                <p className="text-white/50 text-xs flex items-center justify-center gap-2">
                  <span className="text-yellow-400">🔒</span>
                  Secured by Paystack • Your payment is safe and encrypted
                </p>
              </div>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
