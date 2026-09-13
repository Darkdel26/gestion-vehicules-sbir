"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
    Car,
    ChevronLeft,
    CalendarDays,
    MapPin,
    User,
    BriefcaseBusiness,
    RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export default function DemandesPage() {
    const [demandes, setDemandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ==========================================
    // Chargement des demandes
    // ==========================================

    const fetchDemandes = async () => {
        try {
            setError(null);

            const response = await fetch(
                "/api/demandes",
                {
                    cache: "no-store",
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Erreur lors du chargement des demandes."
                );
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(
                    result.message ||
                        "Impossible de charger les demandes."
                );
            }

            setDemandes(result.data || []);
        } catch (error) {
            console.error(
                "FETCH_DEMANDES_ERROR:",
                error
            );

            setError(
                error.message ||
                    "Une erreur est survenue."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDemandes();

        const interval = setInterval(() => {
            fetchDemandes();
        }, 30 * 1000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    // ==========================================
    // Formatage date
    // ==========================================

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleString(
            "fr-FR",
            {
                dateStyle: "medium",
                timeStyle: "short",
            }
        );
    };

    // ==========================================
    // Chargement
    // ==========================================

    if (loading) {
        return (
            <main className="min-h-screen bg-background">

                <section className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
                    <div className="mb-6">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="mt-2 h-4 w-72" />
                    </div>

                    <div className="space-y-3">
                        {Array.from({
                            length: 5,
                        }).map((_, index) => (
                            <div
                                key={index}
                                className="rounded-lg border p-4"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="space-y-2">
                                        <Skeleton className="h-5 w-40" />
                                        <Skeleton className="h-4 w-28" />
                                    </div>

                                    <Skeleton className="h-6 w-20" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background">

            <section className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
                {/* ==================================
                    En-tête
                ================================== */}

                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            Demandes
                        </h1>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Consultez les demandes de véhicules.
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setLoading(true);
                            fetchDemandes();
                        }}
                        className="w-full sm:w-auto"
                    >
                        <RefreshCw className="mr-2 size-4" />
                        Actualiser
                    </Button>
                </div>

                {/* ==================================
                    Erreur
                ================================== */}

                {error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* ==================================
                    Aucune demande
                ================================== */}

                {!error &&
                    demandes.length === 0 && (
                        <div className="rounded-lg border border-dashed p-10 text-center">
                            <Car className="mx-auto mb-3 size-10 text-muted-foreground" />

                            <h2 className="font-medium">
                                Aucune demande
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Il n'y a actuellement aucune demande
                                enregistrée.
                            </p>
                        </div>
                    )}

                {/* ==================================
                    Liste des demandes
                ================================== */}

                {demandes.length > 0 && (
                    <Accordion
                        type="single"
                        collapsible
                        className="space-y-3"
                    >
                        {demandes.map((demande) => (
                            <AccordionItem
                                key={demande.id}
                                value={demande.id}
                                className="rounded-lg border px-4 shadow-sm"
                            >
                                {/* ==================================
                                    Résumé
                                ================================== */}

                                <AccordionTrigger className="py-4 hover:no-underline">
                                    <div className="flex min-w-0 flex-1 items-center gap-3 pr-2 text-left">
                                        {/* Icône */}

                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <Car className="size-5" />
                                        </div>

                                        {/* Véhicule */}

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                                                <span className="truncate font-semibold">
                                                    {
                                                        demande
                                                            .vehicule
                                                            ?.designation
                                                    }
                                                </span>

                                                <span className="text-xs text-muted-foreground">
                                                    {
                                                        demande
                                                            .vehicule
                                                            ?.matricule
                                                    }
                                                </span>
                                            </div>

                                            <div className="mt-1 flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:gap-4">
                                                <span>
                                                    {
                                                        formatDate(
                                                            demande.debut_indisponibilite
                                                        )
                                                    }
                                                </span>

                                                <span className="hidden sm:inline">
                                                    →
                                                </span>

                                                <span>
                                                    {
                                                        formatDate(
                                                            demande.fin_indisponibilite
                                                        )
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        {/* État */}

                                        <Badge
                                            variant={
                                                demande
                                                    .vehicule
                                                    ?.etat ===
                                                "Disponible"
                                                    ? "default"
                                                    : "destructive"
                                            }
                                            className="hidden shrink-0 sm:flex"
                                        >
                                            {
                                                demande
                                                    .vehicule
                                                    ?.etat
                                            }
                                        </Badge>
                                    </div>
                                </AccordionTrigger>

                                {/* ==================================
                                    Détails
                                ================================== */}

                                <AccordionContent className="pb-5">
                                    <div className="grid gap-3 border-t pt-4 sm:grid-cols-2">
                                        {/* Véhicule */}

                                        <InfoCard
                                            icon={Car}
                                            label="Véhicule"
                                            value={
                                                demande
                                                    .vehicule
                                                    ?.designation
                                            }
                                        />

                                        {/* Matricule */}

                                        <InfoCard
                                            icon={Car}
                                            label="Matricule"
                                            value={
                                                demande
                                                    .vehicule
                                                    ?.matricule
                                            }
                                        />

                                        {/* Début */}

                                        <InfoCard
                                            icon={
                                                CalendarDays
                                            }
                                            label="Début"
                                            value={formatDate(
                                                demande.debut_indisponibilite
                                            )}
                                        />

                                        {/* Fin */}

                                        <InfoCard
                                            icon={
                                                CalendarDays
                                            }
                                            label="Fin"
                                            value={formatDate(
                                                demande.fin_indisponibilite
                                            )}
                                        />

                                        {/* Chef de mission */}

                                        <InfoCard
                                            icon={User}
                                            label="Chef de mission"
                                            value={
                                                demande.chef_mission ||
                                                "Non renseigné"
                                            }
                                        />

                                        {/* Mission */}

                                        <InfoCard
                                            icon={
                                                BriefcaseBusiness
                                            }
                                            label="Mission"
                                            value={
                                                demande.mission
                                            }
                                        />

                                        {/* Itinéraire */}

                                        <div className="rounded-lg bg-muted/40 p-4 sm:col-span-2">
                                            <div className="flex gap-3">
                                                <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />

                                                <div className="min-w-0">
                                                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                        Itinéraire
                                                    </p>

                                                    <p className="mt-1 wrap-break-word text-sm font-medium">
                                                        {
                                                            demande.itineraire
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}
            </section>
        </main>
    );
}

// ==========================================
// Carte d'information
// ==========================================

function InfoCard({
    icon: Icon,
    label,
    value,
}) {
    return (
        <div className="rounded-lg bg-muted/40 p-4">
            <div className="flex gap-3">
                <Icon className="mt-0.5 size-5 shrink-0 text-primary" />

                <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {label}
                    </p>

                    <p className="mt-1 wrap-break-word text-sm font-medium">
                        {value || "-"}
                    </p>
                </div>
            </div>
        </div>
    );
}