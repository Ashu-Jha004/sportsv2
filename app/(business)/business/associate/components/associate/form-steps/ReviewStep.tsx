"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAssociateStore } from "@/stores/associate/associate-store";
import { useSubmitApplication } from "../../../hooks/use-associate";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  FileText,
  Trophy,
  Calendar,
  MapPin,
  Loader2,
  CheckCircle,
  Edit,
} from "lucide-react";
import { toast } from "sonner";

interface ReviewStepProps {
  onValidationChange: (isValid: boolean) => void;
}

export function ReviewStep({ onValidationChange }: ReviewStepProps) {
  const router = useRouter();
  const { formData, setCurrentStep, resetForm } = useAssociateStore();
  const { mutateAsync: submitApplication, isPending: isSubmitting } =
    useSubmitApplication();
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    // Always allow proceeding on review step (submit button handles submission)
    onValidationChange(true);
  }, [onValidationChange]);

  const formatSportName = (sport: string) => {
    return sport
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleEdit = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    try {
      // Validate all required fields
      if (!formData.workEmail) {
        toast.error("Work email is required");
        setCurrentStep(0);
        return;
      }

      if (!formData.coverLetter || formData.coverLetter.length < 100) {
        toast.error("Cover letter must be at least 100 characters");
        setCurrentStep(1);
        return;
      }

      if (!formData.primaryExpertise) {
        toast.error("Primary sport expertise is required");
        setCurrentStep(2);
        return;
      }

      if (!formData.yearsOfExperience || formData.yearsOfExperience === 0) {
        toast.error("Years of experience is required");
        setCurrentStep(3);
        return;
      }

      if (!formData.workLatitude || !formData.workLongitude) {
        toast.error("Work location is required");
        setCurrentStep(4);
        return;
      }

      if (!formData.resumeUrl) {
        toast.error("Resume upload is required");
        setCurrentStep(5);
        return;
      }

      // Submit application
      await submitApplication({
        workEmail: formData.workEmail,
        coverLetter: formData.coverLetter,
        primaryExpertise: formData.primaryExpertise,
        secondaryExpertise: formData.secondaryExpertise || [],
        yearsOfExperience: formData.yearsOfExperience,
        workCountry: formData.workCountry!,
        workState: formData.workState!,
        workCity: formData.workCity!,
        workLatitude: formData.workLatitude,
        workLongitude: formData.workLongitude,
        resumeUrl: formData.resumeUrl,
        resumePublicId: formData.resumePublicId!,
      });

      setHasSubmitted(true);

      // Reset form and redirect after short delay
      setTimeout(() => {
        resetForm();
        router.refresh();
      }, 2000);
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(error.message || "Failed to submit application");
    }
  };

  if (hasSubmitted) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Application Submitted!
        </h2>
        <p className="text-gray-600 mb-2">
          Your application has been submitted successfully.
        </p>
        <p className="text-gray-600">
          An admin will review it shortly and you'll be notified of the
          decision.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Review & Submit
        </h2>
        <p className="text-gray-600">
          Please review all information before submitting your application
        </p>
      </div>

      {/* Work Email */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Work Email</h3>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(0)}
            className="text-blue-600"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </div>
        <p className="text-gray-700 ml-14">{formData.workEmail}</p>
      </Card>

      {/* Cover Letter */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Cover Letter</h3>
              <p className="text-sm text-gray-500">
                {formData.coverLetter?.length || 0} characters
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(1)}
            className="text-blue-600"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </div>
        <p className="text-gray-700 ml-14 line-clamp-3">
          {formData.coverLetter}
        </p>
      </Card>

      {/* Sports Expertise */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Trophy className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Sports Expertise</h3>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(2)}
            className="text-blue-600"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </div>
        <div className="ml-14 space-y-3">
          <div>
            <p className="text-sm text-gray-500 mb-1">Primary:</p>
            <Badge variant="default" className="text-sm">
              {formatSportName(formData.primaryExpertise || "")}
            </Badge>
          </div>
          {formData.secondaryExpertise &&
            formData.secondaryExpertise.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Secondary:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.secondaryExpertise.map((sport) => (
                    <Badge key={sport} variant="secondary" className="text-sm">
                      {formatSportName(sport)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
        </div>
      </Card>

      {/* Experience */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Experience</h3>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(3)}
            className="text-blue-600"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </div>
        <p className="text-gray-700 ml-14">
          {formData.yearsOfExperience} years of coaching/mentoring experience
        </p>
      </Card>

      {/* Location */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <MapPin className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Work Location</h3>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(4)}
            className="text-blue-600"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </div>
        <div className="ml-14 space-y-1">
          <p className="text-gray-700">
            {formData.workCity}, {formData.workState}
          </p>
          <p className="text-gray-700">{formData.workCountry}</p>
          <p className="text-sm text-gray-500">
            {formData.workLatitude?.toFixed(4)},{" "}
            {formData.workLongitude?.toFixed(4)}
          </p>
        </div>
      </Card>

      {/* Resume */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Resume</h3>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(5)}
            className="text-blue-600"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </div>
        <div className="ml-14">
          <a
            href={formData.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            View Resume →
          </a>
        </div>
      </Card>

      <Separator />

      {/* Submit Button */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Ready to Submit?</h3>
        <p className="text-sm text-blue-700 mb-4">
          By submitting this application, you confirm that all information
          provided is accurate and complete. Your application will be reviewed
          by an admin.
        </p>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Submitting Application...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Submit Application
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
