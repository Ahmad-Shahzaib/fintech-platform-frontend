"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle } from "lucide-react"

interface AddUserModalDetailProps {
    isOpen: boolean;
    onClose: () => void;
    onAddUser: (user: any) => void;
}

export function AddUserModalDetail({ isOpen, onClose, onAddUser }: AddUserModalDetailProps) {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        role: "user",
        status: "active",
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        // Clear error for this field
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.fullName.trim()) {
            newErrors.fullName = "Full name is required"
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required"
        } else if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            newErrors.email = "Please enter a valid email"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (validateForm()) {
            onAddUser(formData)
            setFormData({ fullName: "", email: "", role: "user", status: "active" })
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-card border border-border">
                <DialogHeader>
                    <DialogTitle className="text-foreground">Add New User</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Create a new user account in the system
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Full Name */}
                    <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-foreground font-medium">
                            Full Name
                        </Label>
                        <Input
                            id="fullName"
                            placeholder="John Doe"
                            value={formData.fullName}
                            onChange={(e) => handleChange("fullName", e.target.value)}
                            className={`bg-input border ${errors.fullName ? "border-destructive" : "border-border"}`}
                        />
                        {errors.fullName && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {errors.fullName}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-foreground font-medium">
                            Email Address
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            className={`bg-input border ${errors.email ? "border-destructive" : "border-border"}`}
                        />
                        {errors.email && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Role */}
                    <div className="space-y-2">
                        <Label htmlFor="role" className="text-foreground font-medium">
                            User Role
                        </Label>
                        <Select value={formData.role} onValueChange={(value) => handleChange("role", value)}>
                            <SelectTrigger className="bg-input border border-border">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card border border-border">
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="moderator">Moderator</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <Label htmlFor="status" className="text-foreground font-medium">
                            Initial Status
                        </Label>
                        <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                            <SelectTrigger className="bg-input border border-border">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card border border-border">
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="border-border text-foreground hover:bg-muted bg-transparent"
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} className="bg-primary text-primary-foreground hover:bg-primary/90">
                        Create User
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
