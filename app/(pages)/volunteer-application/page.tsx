"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/app/components/Navbar";
import { submitVolunteerApplication } from "./actions";
import { CheckCircle, Loader2, Users, User, Phone, Heart } from "lucide-react";

interface VolunteerApplicationForm {
  fullName: string;
  phoneNumber: string;
  gender: string;
  role: string;
}

// Role options with user-friendly labels
const VOLUNTEER_ROLES = [
  { value: "LOGISTICS_SETUP", label: "Logistics & Setup" },
  { value: "ASSISTANCE", label: "General Assistance" },
  { value: "SOCIAL_MEDIA_SUPPORT", label: "Social Media Support" },
  {
    value: "TECH_SUPPORT_STAGE_MANAGEMENT",
    label: "Tech Support/Stage Management",
  },
  { value: "CONTENT_CREATION", label: "Content Creation" },
  {
    value: "GUEST_REGISTRATION_TICKETING",
    label: "Guest Registration/Ticketing",
  },
  { value: "CROWD_CONTROL", label: "Crowd Control" },
  { value: "SALES_MARKETING", label: "Sales/Marketing" },
  { value: "OFFLINE_PUBLICITY", label: "Offline Publicity" },
  { value: "MEDICALS", label: "Medical Support" },
  { value: "GAMES", label: "Games & Activities" },
  { value: "PR_TEAM", label: "PR Team" },
];

// Gender options
const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  //   { value: 'OTHER', label: 'Other' },
  //   { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' }
];

export default function VolunteerApplicationPage() {
  const [formData, setFormData] = useState<VolunteerApplicationForm>({
    fullName: "",
    phoneNumber: "",
    gender: "",
    role: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    field: keyof VolunteerApplicationForm,
    value: string
  ) => {
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
    if (!formData.gender) return "Please select your gender";
    if (!formData.role) return "Please select a volunteer role";

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
      const result = await submitVolunteerApplication(formData);

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
                Thank you for volunteering to help make shutupnraveee 2025
                amazing! We&apos;ve received your application and will review it
                shortly.
              </p>
              <div className="space-y-4">
                {/* <p className="text-white/60 text-sm">
                  You&apos;ll hear back from us within 48 hours via phone.
                </p> */}
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
            ❤️
          </div>
          <div className="absolute top-1/3 right-16 text-yellow-400 text-xl opacity-10 animate-bounce">
            🤝
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
            Be Part of the <span className="text-yellow-400">Magic</span>
          </h1>
          <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
            Want to help create an unforgettable experience? Join our volunteer
            team and be part of something special at unwind 2025. Every role
            matters!
          </p>
          <div className="flex items-center justify-center gap-8 text-white/60 text-sm">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-yellow-400" />
              <span>Make a Difference</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-yellow-400" />
              <span>Build Community</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-yellow-400" />
              <span>Gain Experience</span>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">
              Volunteer Application
            </h3>
            <p className="text-white/60 text-sm">
              Join our team and help make the event amazing
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

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Gender */}
                <div className="space-y-2 w-full md:w-1/2">
                  <Label
                    htmlFor="gender"
                    className="text-white/80 font-medium flex items-center gap-2"
                  >
                    <Users className="w-4 h-4 text-yellow-400" />
                    Gender *
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) =>
                      handleInputChange("gender", value)
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-full bg-white/10 border-white/20 text-white focus:border-yellow-400 focus:ring-yellow-400/50">
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/20">
                      {GENDER_OPTIONS.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="text-white hover:bg-white/10 focus:bg-white/10"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Volunteer Role */}
                <div className="space-y-2 w-full md:w-1/2">
                  <Label
                    htmlFor="role"
                    className="text-white/80 font-medium flex items-center gap-2"
                  >
                    <Heart className="w-4 h-4 text-yellow-400" />
                    What role are you most suited for? *
                  </Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleInputChange("role", value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-full bg-white/10 border-white/20 text-white focus:border-yellow-400 focus:ring-yellow-400/50">
                      <SelectValue placeholder="Choose your preferred role" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/20 max-h-60">
                      {VOLUNTEER_ROLES.map((role) => (
                        <SelectItem
                          key={role.value}
                          value={role.value}
                          className="text-white hover:bg-white/10 focus:bg-white/10"
                        >
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {/* <p className="text-white/50 text-xs">
                    Choose the role that best matches your skills and interests
                  </p> */}
                </div>
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
                      "Submit Volunteer Application"
                    )}
                  </Button>

                  {/* <p className="text-white/50 text-xs text-center">
                    We&apos;ll review your application and contact you within 48
                    hours via phone.
                  </p> */}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Additional Info Section */}
          <div className="mt-12 text-center space-y-6">
            <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-6">
              <h4 className="text-yellow-400 font-bold mb-3">
                Why Volunteer With Us?
              </h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-white/70">
                <div>• Be part of creating an epic experience</div>
                <div>• Network with amazing people</div>
                <div>• Gain valuable event management experience</div>
                <div>• Get exclusive volunteer perks</div>
                <div>• Make lasting friendships</div>
                <div>• Contribute to the tech & creative community</div>
              </div>
            </div>

            <p className="text-white/60 text-sm">
              Questions about volunteering?
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
