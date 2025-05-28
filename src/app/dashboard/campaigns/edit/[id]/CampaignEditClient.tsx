"use client"
import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import DashboardLayout from "@/components/dashboard-layout"
import { SERVER_URL } from "@/constants"
import { useAuth } from "@/contexts/authContext"
import Image from "next/image"

interface FormData {
    title: string
    description: string
    amountNeeded: string
    bankAccountNumber: string
    bankAccountName: string
    bankName: string
}

interface FormErrors {
    title?: string
    description?: string
    amountNeeded?: string
    bankAccountNumber?: string
    bankAccountName?: string
    bankName?: string
    images?: string
}

const CampaignEditClient = ({ id }: { id: string }) => {
    const { token } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<FormData>({
        title: "",
        description: "",
        amountNeeded: "",
        bankAccountNumber: "",
        bankAccountName: "",
        bankName: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [images, setImages] = useState<File[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCampaign = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${SERVER_URL}/api/campaigns/${id}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (response.ok) {
                    const data = await response.json();
                    const c = data.campaign;
                    setFormData({
                        title: c.title || "",
                        description: c.description || "",
                        amountNeeded: c.amountNeeded ? String(c.amountNeeded) : "",
                        bankAccountNumber: c.bankAccountNumber || "",
                        bankAccountName: c.bankAccountName || "",
                        bankName: c.bankName || "",
                    });
                    setExistingImageUrls(c.images || []);
                } else {
                    toast({
                        title: "Error",
                        description: "Failed to load campaign details",
                        variant: "destructive",
                    });
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to load campaign details",
                    variant: "destructive",
                });
                console.error("Error fetching campaign:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCampaign();
        // eslint-disable-next-line
    }, [id, token]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            if (images.length + existingImageUrls.length + selectedFiles.length > 5) {
                setErrors((prev) => ({ ...prev, images: "Maximum 5 images allowed" }));
                return;
            }
            if (errors.images) {
                setErrors((prev) => ({ ...prev, images: undefined }));
            }
            setImages((prev) => [...prev, ...selectedFiles]);
            const newImageUrls = selectedFiles.map((file) => URL.createObjectURL(file));
            setImageUrls((prev) => [...prev, ...newImageUrls]);
        }
    };

    const removeImage = (index: number, isExisting: boolean) => {
        if (isExisting) {
            setExistingImageUrls((prev) => prev.filter((_, i) => i !== index));
        } else {
            URL.revokeObjectURL(imageUrls[index - existingImageUrls.length]);
            setImages((prev) => prev.filter((_, i) => i !== index - existingImageUrls.length));
            setImageUrls((prev) => prev.filter((_, i) => i !== index - existingImageUrls.length));
        }
        if (errors.images) {
            setErrors((prev) => ({ ...prev, images: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        if (!formData.title.trim()) newErrors.title = "Title is required";
        if (!formData.description.trim()) newErrors.description = "Description is required";
        if (!formData.amountNeeded) newErrors.amountNeeded = "Amount is required";
        else if (isNaN(Number(formData.amountNeeded)) || Number(formData.amountNeeded) <= 0) newErrors.amountNeeded = "Amount must be a positive number";
        if (!formData.bankAccountNumber.trim()) newErrors.bankAccountNumber = "Account number is required";
        if (!formData.bankAccountName.trim()) newErrors.bankAccountName = "Account name is required";
        if (!formData.bankName.trim()) newErrors.bankName = "Bank name is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            toast({
                title: "Validation Error",
                description: "Please fix the errors in the form",
                variant: "destructive",
            });
            return;
        }
        setIsSubmitting(true);
        try {
            // Update campaign details
            const response = await fetch(`${SERVER_URL}/api/campaigns/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    amountNeeded: formData.amountNeeded,
                    bankAccountNumber: formData.bankAccountNumber,
                    bankAccountName: formData.bankAccountName,
                    bankName: formData.bankName,
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                toast({
                    title: "Error",
                    description: errorData.message || "Failed to update campaign",
                    variant: "destructive",
                });
                setIsSubmitting(false);
                return;
            }
            // If images were changed, update images
            if (images.length > 0 || existingImageUrls.length < 1) {
                const formDataToSend = new FormData();
                images.forEach((image) => {
                    formDataToSend.append("images", image);
                });
                // If you want to keep some existing images, you may need to send their URLs as well
                existingImageUrls.forEach((url) => {
                    formDataToSend.append("existingImages", url);
                });
                const imgRes = await fetch(`${SERVER_URL}/api/campaigns/${id}/images`, {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formDataToSend,
                });
                if (!imgRes.ok) {
                    const errorData = await imgRes.json();
                    toast({
                        title: "Error",
                        description: errorData.message || "Failed to update images",
                        variant: "destructive",
                    });
                    setIsSubmitting(false);
                    return;
                }
            }
            toast({
                title: "Success",
                description: "Campaign updated successfully",
            });
            router.push(`/dashboard/campaigns/${id}`);
        } catch (error) {
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive",
            });
            console.error("Error updating campaign:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatCurrency = (value: string) => {
        const numericValue = value.replace(/[^0-9]/g, "");
        if (numericValue) {
            return new Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: "NGN",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            })
                .format(Number(numericValue))
                .replace("NGN", "")
                .trim();
        }
        return "";
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, "");
        setFormData((prev) => ({ ...prev, amountNeeded: rawValue }));
        if (errors.amountNeeded) {
            setErrors((prev) => ({ ...prev, amountNeeded: undefined }));
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center items-center py-16">
                    <div className="flex flex-col items-center">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
                        <p className="mt-4 text-emerald-800">Loading campaign details...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Back button */}
                <div>
                    <Link href="/dashboard/campaigns">
                        <Button variant="ghost" className="pl-0 text-gray-500 hover:text-emerald-700 hover:bg-transparent">
                            Back to Campaigns
                        </Button>
                    </Link>
                </div>
                {/* Header with gradient background */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-800 p-8 text-white shadow-lg">
                    <div className="absolute right-0 top-0 opacity-10"></div>
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold mb-2">Edit Campaign</h2>
                        <p className="text-emerald-100">Update the details of your campaign below.</p>
                    </div>
                </div>
                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-8">
                        {/* Title */}
                        <div>
                            <label className="block font-medium mb-1">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className={`w-full border rounded px-3 py-2 ${errors.title ? "border-red-500" : "border-gray-300"}`}
                                placeholder="Campaign title"
                            />
                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                        </div>
                        {/* Description */}
                        <div>
                            <label className="block font-medium mb-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className={`w-full border rounded px-3 py-2 ${errors.description ? "border-red-500" : "border-gray-300"}`}
                                placeholder="Describe the campaign"
                                rows={4}
                            />
                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                        </div>
                        {/* Amount Needed */}
                        <div>
                            <label className="block font-medium mb-1">Amount Needed</label>
                            <input
                                type="text"
                                name="amountNeeded"
                                value={formatCurrency(formData.amountNeeded)}
                                onChange={handleAmountChange}
                                className={`w-full border rounded px-3 py-2 ${errors.amountNeeded ? "border-red-500" : "border-gray-300"}`}
                                placeholder="e.g. 100000"
                            />
                            {errors.amountNeeded && <p className="text-red-500 text-sm mt-1">{errors.amountNeeded}</p>}
                        </div>
                        {/* Bank Account Number */}
                        <div>
                            <label className="block font-medium mb-1">Bank Account Number</label>
                            <input
                                type="text"
                                name="bankAccountNumber"
                                value={formData.bankAccountNumber}
                                onChange={handleChange}
                                className={`w-full border rounded px-3 py-2 ${errors.bankAccountNumber ? "border-red-500" : "border-gray-300"}`}
                                placeholder="Account number"
                            />
                            {errors.bankAccountNumber && <p className="text-red-500 text-sm mt-1">{errors.bankAccountNumber}</p>}
                        </div>
                        {/* Bank Account Name */}
                        <div>
                            <label className="block font-medium mb-1">Bank Account Name</label>
                            <input
                                type="text"
                                name="bankAccountName"
                                value={formData.bankAccountName}
                                onChange={handleChange}
                                className={`w-full border rounded px-3 py-2 ${errors.bankAccountName ? "border-red-500" : "border-gray-300"}`}
                                placeholder="Account name"
                            />
                            {errors.bankAccountName && <p className="text-red-500 text-sm mt-1">{errors.bankAccountName}</p>}
                        </div>
                        {/* Bank Name */}
                        <div>
                            <label className="block font-medium mb-1">Bank Name</label>
                            <input
                                type="text"
                                name="bankName"
                                value={formData.bankName}
                                onChange={handleChange}
                                className={`w-full border rounded px-3 py-2 ${errors.bankName ? "border-red-500" : "border-gray-300"}`}
                                placeholder="Bank name"
                            />
                            {errors.bankName && <p className="text-red-500 text-sm mt-1">{errors.bankName}</p>}
                        </div>
                        {/* Images */}
                        <div>
                            <label className="block font-medium mb-1">Images (max 5)</label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                className="mb-2"
                            />
                            {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
                            <div className="flex flex-wrap gap-2 mt-2">
                                {existingImageUrls.map((url, i) => (
                                    <div key={url} className="relative w-24 h-24">
                                        <Image src={url} alt="Campaign" className="object-cover w-full h-full rounded" width={240} height={240} />
                                        <button
                                            type="button"
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs"
                                            onClick={() => removeImage(i, true)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                {imageUrls.map((url, i) => (
                                    <div key={url} className="relative w-24 h-24">
                                        <Image src={url} alt="Preview" className="object-cover w-full h-full rounded" width={240} height={240} />
                                        <button
                                            type="button"
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs"
                                            onClick={() => removeImage(i + existingImageUrls.length, false)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Submit */}
                        <div>
                            <Button type="submit" disabled={isSubmitting} className="w-full">
                                {isSubmitting ? "Updating..." : "Update Campaign"}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}

export default CampaignEditClient;