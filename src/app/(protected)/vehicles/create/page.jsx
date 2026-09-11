"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
    Car,
    ArrowLeft,
    Save,
    Loader2,
    AlertCircle,
} from "lucide-react";

export default function CreateVehiclePage() {
    const router = useRouter();

    const [designation, setDesignation] =
        useState("");

    const [matricule, setMatricule] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        const cleanDesignation =
            designation.trim();

        const cleanMatricule =
            matricule.trim().toUpperCase();

        if (!cleanDesignation) {
            setError(
                "La désignation est obligatoire."
            );
            return;
        }

        if (!cleanMatricule) {
            setError(
                "Le matricule est obligatoire."
            );
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                "/api/vehicles",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        designation:
                            cleanDesignation,
                        matricule:
                            cleanMatricule,
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                        "Impossible de créer le véhicule."
                );
            }

            router.push("/vehicles");
            router.refresh();
        } catch (error) {
            console.error(
                "CREATE_VEHICLE_ERROR:",
                error
            );

            setError(
                error.message ||
                    "Impossible de créer le véhicule."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        Administration
                    </BreadcrumbItem>

                    <BreadcrumbSeparator />

                    <BreadcrumbItem>
                        <Link
                            href="/vehicles"
                            className="hover:underline"
                        >
                            Véhicules
                        </Link>
                    </BreadcrumbItem>

                    <BreadcrumbSeparator />

                    <BreadcrumbItem>
                        <BreadcrumbPage>
                            Nouveau véhicule
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Formulaire */}
            <div className="max-w-2xl rounded-lg border bg-card p-6">
                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    {/* Erreur */}
                    {error && (
                        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                            <span>{error}</span>
                        </div>
                    )}

                    {/* Désignation */}
                    <div className="space-y-2">
                        <label
                            htmlFor="designation"
                            className="text-sm font-medium"
                        >
                            Désignation
                            <span className="ml-1 text-destructive">
                                *
                            </span>
                        </label>

                        <Input
                            id="designation"
                            value={designation}
                            onChange={(event) =>
                                setDesignation(
                                    event.target.value
                                )
                            }
                            placeholder="Ex. Toyota Hilux"
                            disabled={loading}
                            autoFocus
                        />
                    </div>

                    {/* Matricule */}
                    <div className="space-y-2">
                        <label
                            htmlFor="matricule"
                            className="text-sm font-medium"
                        >
                            Matricule
                            <span className="ml-1 text-destructive">
                                *
                            </span>
                        </label>

                        <Input
                            id="matricule"
                            value={matricule}
                            onChange={(event) =>
                                setMatricule(
                                    event.target.value
                                )
                            }
                            placeholder="Ex. AB 1234 RB"
                            disabled={loading}
                            className="uppercase"
                        />

                        <p className="text-xs text-muted-foreground">
                            Le matricule doit être unique.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            asChild
                            disabled={loading}
                        >
                            <Link href="/vehicles" className="flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                <span>Annuler</span>
                            </Link>
                        </Button>

                        <Button
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Enregistrement...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Enregistrer
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}