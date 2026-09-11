"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Skeleton } from "@/components/ui/skeleton";

import {
    Car,
    ArrowLeft,
    Save,
    Loader2,
    AlertCircle,
} from "lucide-react";

export default function EditVehiclePage() {
    const params = useParams();
    const router = useRouter();

    const vehicleId = params.id;

    const [designation, setDesignation] =
        useState("");

    const [matricule, setMatricule] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    // =====================================================
    // CHARGEMENT DU VÉHICULE
    // =====================================================

    useEffect(() => {
        if (!vehicleId) {
            return;
        }

        let isMounted = true;

        const loadVehicle = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `/api/vehicles/${vehicleId}`,
                    {
                        cache: "no-store",
                    }
                );

                const data =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.error ||
                            "Impossible de récupérer le véhicule."
                    );
                }

                if (isMounted) {
                    setDesignation(
                        data.designation || ""
                    );

                    setMatricule(
                        data.matricule || ""
                    );
                }
            } catch (error) {
                console.error(
                    "LOAD_VEHICLE_ERROR:",
                    error
                );

                if (isMounted) {
                    setError(
                        error.message ||
                            "Impossible de récupérer le véhicule."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadVehicle();

        return () => {
            isMounted = false;
        };
    }, [vehicleId]);

    // =====================================================
    // MODIFICATION
    // =====================================================

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
            setSaving(true);

            const response = await fetch(
                `/api/vehicles/${vehicleId}`,
                {
                    method: "PUT",
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
                        "Impossible de modifier le véhicule."
                );
            }

            router.push("/vehicles");
            router.refresh();
        } catch (error) {
            console.error(
                "UPDATE_VEHICLE_ERROR:",
                error
            );

            setError(
                error.message ||
                    "Impossible de modifier le véhicule."
            );
        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="space-y-6">
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
                                Modifier
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div>
                    <Skeleton className="h-8 w-64" />

                    <Skeleton className="mt-2 h-4 w-80" />
                </div>

                <div className="max-w-2xl rounded-lg border p-6">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full" />
                        </div>

                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full" />
                        </div>

                        <div className="flex justify-end gap-3 border-t pt-6">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-32" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                            Modifier
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
                            disabled={saving}
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
                            disabled={saving}
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
                            disabled={saving}
                        >
                            <Link href="/vehicles" className="flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                <span>Annuler</span>
                            </Link>
                        </Button>

                        <Button
                            type="submit"
                            disabled={saving}
                        >
                            {saving ? (
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