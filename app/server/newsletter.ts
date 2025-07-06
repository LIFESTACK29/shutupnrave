"use server";

import { prisma } from "@/lib/db";
import { z } from "zod";

// Define a schema for email validation
const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Type for our response
type SubscribeResponse = {
  success: boolean;
  message: string;
};

export async function subscribeToNewsletter(
  email: string
): Promise<SubscribeResponse> {
  try {
    // 1. Validate the email
    const validatedData = emailSchema.parse({ email });

    // 2. Check if email already exists
    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: validatedData.email },
    });

    if (existingSubscriber) {
      // If they exist but were inactive, reactivate them
      if (!existingSubscriber.active) {
        await prisma.newsletterSubscriber.update({
          where: { email: validatedData.email },
          data: { active: true },
        });
        return {
          success: true,
          message: "Welcome back! You've been resubscribed to our newsletter.",
        };
      }

      return {
        success: false,
        message: "This email is already subscribed to our newsletter.",
      };
    }

    // 3. Create new subscriber
    await prisma.newsletterSubscriber.create({
      data: {
        email: validatedData.email,
      },
    });

    // 4. Return success response
    return {
      success: true,
      message: "Thanks for subscribing! Check your inbox for updates.",
    };
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Please enter a valid email address.",
      };
    }

    // Log the error for debugging (you should use proper error logging in production)
    console.error("Newsletter subscription error:", error);

    // Return generic error message to user
    return {
      success: false,
      message: "Something went wrong. Please try again later.",
    };
  }
}
