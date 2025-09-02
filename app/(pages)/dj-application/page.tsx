"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Separator } from "@/components/ui/separator";
import Navbar from "@/app/components/Navbar";
import { submitDJApplication } from "./actions";
import {
  CheckCircle,
  Loader2,
  Music,
  Instagram,
  Link as LinkIcon,
  User,
  Phone,
} from "lucide-react";

interface DJApplicationForm {
  fullName: string;
  phoneNumber: string;
  instagramHandle: string;
  mixLink: string;
}

export default function DJApplicationPage() {
  const [formData, setFormData] = useState<DJApplicationForm>({
    fullName: "",
    phoneNumber: "",
    instagramHandle: "",
    mixLink: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof DJApplicationForm, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.fullName.trim()) return "Full name is required";
    if (!formData.phoneNumber.trim()) return "Phone number is required";
    if (formData.phoneNumber.length < 11)
      return "Phone number must be at least 11 digits";
    if (!formData.instagramHandle.trim()) return "Instagram handle is required";
    if (!formData.mixLink.trim()) return "Mix link is required";

    // Validate Instagram handle format
    const instagramRegex = /^@?[A-Za-z0-9_.]+$/;
    if (!instagramRegex.test(formData.instagramHandle.replace("@", ""))) {
      return "Please enter a valid Instagram handle";
    }

    // Validate URL format
    try {
      new URL(formData.mixLink);
    } catch {
      return "Please enter a valid URL for your mix";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await submitDJApplication(formData);

      if (result.success) {
        setIsSubmitted(true);
      } else {
        setError(
          result.error || "Failed to submit application. Please try again."
        );
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (isSubmitted) {
    return (
      <section className="bg-black text-white min-h-screen px-4">
        <Navbar />

        <div className="pt-24 pb-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                Application <span className="text-yellow-400">Submitted!</span>
              </h1>
              <p className="text-white/70 text-lg mb-8">
                Thanks for applying! We&apos;ve received your DJ application and
                will review it shortly.
              </p>
              <div className="space-y-4">
                <p className="text-white/60 text-sm">
                  Keep an eye on your Instagram DMs and phone for updates.
                </p>
                <Button
                  onClick={() => (window.location.href = "/")}
                  className="bg-yellow-400 text-black font-semibold hover:bg-white transition-colors duration-300"
                >
                  Back to Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-black text-white min-h-screen px-4">
      <Navbar />

      {/* Header Section */}
      <section className="pt-12 md:pt-24 pb-8 px-4 border-b border-white/10 relative">
        {/* Floating decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden hidden">
          <div className="absolute top-20 left-10 text-yellow-400 text-2xl opacity-10 animate-pulse">
            🎧
          </div>
          <div className="absolute top-1/3 right-16 text-yellow-400 text-xl opacity-10 animate-bounce">
            🎵
          </div>
          <div className="absolute bottom-1/4 left-1/4 text-yellow-400 text-lg opacity-10 animate-pulse">
            ⚡
          </div>
          <div className="absolute bottom-20 right-20 text-yellow-400 text-2xl opacity-10 animate-bounce">
            🚀
          </div>
        </div>

        <div className="max-w-4xl mx-auto text-center pt-14 relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            Ready to <span className="text-yellow-400">Drop the Beat?</span>
          </h1>
          <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
            Think you&apos;ve got what it takes to make the crowd lose their
            minds? We&apos;re looking for DJs who can bring the heat to
            shutupnraveee 2025.
          </p>
          <div className="flex items-center justify-center gap-8 text-white/60 text-sm">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-yellow-400" />
              <span>All Genres Welcome</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-yellow-400" />
              <span>Quick Review Process</span>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">
              DJ Application
            </h3>
            <p className="text-white/60 text-sm">
              Fill out the form below to apply
            </p>
          </div>

          <Card className="bg-white/5 border-yellow-400/30 hover:border-yellow-400/50 transition-all duration-300">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="fullName"
                    className="text-white/80 font-medium flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-yellow-400" />
                    Full Name *
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                    placeholder="Enter your full name"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-yellow-400 focus:ring-yellow-400/50"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label
                    htmlFor="phoneNumber"
                    className="text-white/80 font-medium flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4 text-yellow-400" />
                    Phone Number *
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      handleInputChange("phoneNumber", e.target.value)
                    }
                    placeholder="e.g., 08012345678"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-yellow-400 focus:ring-yellow-400/50"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Instagram Handle */}
                <div className="space-y-2">
                  <Label
                    htmlFor="instagramHandle"
                    className="text-white/80 font-medium flex items-center gap-2"
                  >
                    <Instagram className="w-4 h-4 text-yellow-400" />
                    Instagram Handle *
                  </Label>
                  <Input
                    id="instagramHandle"
                    type="text"
                    value={formData.instagramHandle}
                    onChange={(e) =>
                      handleInputChange("instagramHandle", e.target.value)
                    }
                    placeholder="@yourusername or yourusername"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-yellow-400 focus:ring-yellow-400/50"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Mix Link */}
                <div className="space-y-2">
                  <Label
                    htmlFor="mixLink"
                    className="text-white/80 font-medium flex items-center gap-2"
                  >
                    <LinkIcon className="w-4 h-4 text-yellow-400" />
                    Link to Your DJ Mix *
                  </Label>
                  <Input
                    id="mixLink"
                    type="url"
                    value={formData.mixLink}
                    onChange={(e) =>
                      handleInputChange("mixLink", e.target.value)
                    }
                    placeholder="Spotify, Audiomack, Apple Music, SoundCloud, etc."
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-yellow-400 focus:ring-yellow-400/50"
                    disabled={isSubmitting}
                  />
                  <p className="text-white/50 text-xs">
                    Share your best mix from Spotify, Audiomack, Apple Music,
                    SoundCloud, or any platform
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <Separator className="bg-white/20" />

                {/* Submit Button */}
                <div className="space-y-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-yellow-400 text-black font-semibold hover:bg-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting Application...
                      </>
                    ) : (
                      "Submit DJ Application"
                    )}
                  </Button>

                  {/* <p className="text-white/50 text-xs text-center">
                    We&apos;ll review your application and get back to you.
                  </p> */}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Additional Info Section */}
          <div className="mt-12 text-center space-y-6">
            <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-6">
              <h4 className="text-yellow-400 font-bold mb-3">
                What We&apos;re Looking For
              </h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-white/70">
                <div>• High-energy sets that get people moving</div>
                <div>• Professional attitude and reliability</div>
                <div>• Experience performing for crowds</div>
                <div>• Quality audio in your demo mix</div>
                <div>• Willingness to adapt to the crowd</div>
                <div>• Passion for creating unforgettable moments</div>
              </div>
            </div>

            <p className="text-white/60 text-sm">
              Questions about the application process?
              <a
                href="mailto:info@shutupnrave.com.ng"
                className="text-yellow-400 hover:text-white transition-colors ml-1"
              >
                Contact us
              </a>
            </p>
          </div>
        </div>
      </section>
    </section>
  );
}
