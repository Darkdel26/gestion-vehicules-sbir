"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Car, Search, Send } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
    const [vehicles, setVehicles] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    // ==========================================
    // Demande
    // ==========================================

    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);

    const [form, setForm] = useState({
        debut_indisponibilite: "",
        fin_indisponibilite: "",
        chef_mission: "",
        mission: "",
        itineraire: "",
    });

    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);

    // ==========================================
    // Chargement des véhicules
    // ==========================================

    useEffect(() => {
        let isMounted = true;

        const fetchVehicles = async () => {
            try {
                const response = await fetch(
                    "/api/public/vehicles",
                    {
                        cache: "no-store",
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Erreur lors du chargement des véhicules"
                    );
                }

                const data = await response.json();

                if (isMounted) {
                    setVehicles(data);
                }
            } catch (error) {
                console.error(
                    "FETCH_VEHICLES_ERROR:",
                    error
                );
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchVehicles();

        const interval = setInterval(() => {
            fetchVehicles();
        }, 30 * 1000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    // ==========================================
    // Recherche
    // ==========================================

    const filteredVehicles = useMemo(() => {
        const value = search.toLowerCase().trim();

        if (!value) return vehicles;

        return vehicles.filter(
            (vehicle) =>
                vehicle.designation
                    .toLowerCase()
                    .includes(value) ||
                vehicle.matricule
                    .toLowerCase()
                    .includes(value)
        );
    }, [vehicles, search]);

    // ==========================================
    // Ouverture du popup
    // ==========================================

    const handleOpenRequest = (vehicle) => {
        setSelectedVehicle(vehicle);

        setForm({
            debut_indisponibilite: "",
            fin_indisponibilite: "",
            chef_mission: "",
            mission: "",
            itineraire: "",
        });

        setMessage(null);
        setOpenDialog(true);
    };

    // ==========================================
    // Modification du formulaire
    // ==========================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // ==========================================
    // Envoi de la demande
    // ==========================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedVehicle) return;

        setSubmitting(true);
        setMessage(null);

        try {
            const response = await fetch(
                "/api/demandes",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        vehiculeId: selectedVehicle.id,

                        debut_indisponibilite:
                            form.debut_indisponibilite,

                        fin_indisponibilite:
                            form.fin_indisponibilite,

                        chef_mission:
                            form.chef_mission,

                        mission:
                            form.mission,

                        itineraire:
                            form.itineraire,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage({
                    type: "error",
                    text:
                        data.message ||
                        "Impossible d'enregistrer la demande.",
                });

                return;
            }

            setMessage({
                type: "success",
                text:
                    data.message ||
                    "Votre demande a été enregistrée avec succès.",
            });

            // Fermer le popup après un court délai
            setTimeout(() => {
                setOpenDialog(false);
                setMessage(null);
            }, 1500);
        } catch (error) {
            console.error(
                "CREATE_DEMANDE_ERROR:",
                error
            );

            setMessage({
                type: "error",
                text:
                    "Une erreur est survenue lors de l'envoi de la demande.",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-background">
            {/* ==========================================
                Navbar
            ========================================== */}

            <nav className="border-b bg-background">
                <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4">
                    <Link
                        href="/"
                        className="flex shrink-0 items-center gap-2"
                    >
                        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Car className="size-5" />
                        </div>

                        <span className="font-semibold">
                            Véhicules
                        </span>
                    </Link>

                    <Link
                        href="/login"
                        className="rounded-sm bg-primary px-3 py-2 text-xs font-medium text-white sm:text-sm"
                    >
                        Gestion
                    </Link>
                </div>
            </nav>

            {/* ==========================================
                Recherche
            ========================================== */}

            <section
                className="relative bg-cover bg-center"
                style={{
                    backgroundImage:
                        "url('/home-bg.jpg')",
                }}
            >
                <div className="absolute inset-0 bg-black/50" />

                <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-20">
                    <div className="mx-auto max-w-xl">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />

                            <Input
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                placeholder="Rechercher un véhicule..."
                                className="h-12 bg-white pl-12 text-black shadow-lg"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ==========================================
                Liste des véhicules
            ========================================== */}

            <section className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
                {loading ? (
                    <div className="space-y-3">
                        {Array.from({
                            length: 5,
                        }).map((_, index) => (
                            <div
                                key={index}
                                className="rounded-lg border p-4"
                            >
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-40" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Desktop */}

                        <div className="hidden overflow-hidden rounded-lg border sm:block">
                            {/* En-tête */}

                            <div className="grid grid-cols-[1fr_1fr_140px_180px] gap-4 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
                                <span>Désignation</span>
                                <span>Matricule</span>
                                <span>État</span>
                                <span className="text-right">
                                    Action
                                </span>
                            </div>

                            {/* Véhicules */}

                            {filteredVehicles.map(
                                (vehicle) => (
                                    <div
                                        key={vehicle.id}
                                        className="grid grid-cols-[1fr_1fr_140px_180px] items-center gap-4 border-b px-4 py-4 text-sm last:border-0 hover:bg-muted/30"
                                    >
                                        <span className="font-medium">
                                            {
                                                vehicle.designation
                                            }
                                        </span>

                                        <span className="text-muted-foreground">
                                            {
                                                vehicle.matricule
                                            }
                                        </span>

                                        <span>
                                            <Badge
                                                variant={
                                                    vehicle.etat ===
                                                    "Disponible"
                                                        ? "default"
                                                        : "destructive"
                                                }
                                            >
                                                {
                                                    vehicle.etat
                                                }
                                            </Badge>
                                        </span>

                                        <div className="text-right">
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    handleOpenRequest(
                                                        vehicle
                                                    )
                                                }
                                            >
                                                <Send className="mr-2 size-4" />

                                                Faire une demande
                                            </Button>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>

                        {/* Mobile */}

                        <div className="space-y-3 sm:hidden">
                            {filteredVehicles.map(
                                (vehicle) => (
                                    <div
                                        key={vehicle.id}
                                        className="rounded-lg border bg-background p-4 shadow-sm"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <h3 className="truncate font-medium">
                                                    {
                                                        vehicle.designation
                                                    }
                                                </h3>

                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {
                                                        vehicle.matricule
                                                    }
                                                </p>
                                            </div>

                                            <Badge
                                                className="shrink-0"
                                                variant={
                                                    vehicle.etat ===
                                                    "Disponible"
                                                        ? "default"
                                                        : "destructive"
                                                }
                                            >
                                                {
                                                    vehicle.etat
                                                }
                                            </Badge>
                                        </div>

                                        <Button
                                            className="mt-4 w-full"
                                            disabled={
                                                vehicle.etat !==
                                                "Disponible"
                                            }
                                            onClick={() =>
                                                handleOpenRequest(
                                                    vehicle
                                                )
                                            }
                                        >
                                            <Send className="mr-2 size-4" />

                                            Faire une demande
                                        </Button>
                                    </div>
                                )
                            )}
                        </div>

                        {/* Aucun résultat */}

                        {filteredVehicles.length === 0 && (
                            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                                Aucun véhicule trouvé.
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* ==========================================
                Popup demande
            ========================================== */}

            <Dialog
                open={openDialog}
                onOpenChange={setOpenDialog}
            >
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            Faire une demande
                        </DialogTitle>

                        <DialogDescription>
                            {selectedVehicle && (
                                <>
                                    Véhicule :{" "}
                                    <strong>
                                        {
                                            selectedVehicle.designation
                                        }
                                    </strong>{" "}
                                    —{" "}
                                    {
                                        selectedVehicle.matricule
                                    }
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        {/* Dates */}

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="debut_indisponibilite">
                                    Début
                                </Label>

                                <Input
                                    id="debut_indisponibilite"
                                    name="debut_indisponibilite"
                                    type="datetime-local"
                                    value={
                                        form.debut_indisponibilite
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="fin_indisponibilite">
                                    Fin
                                </Label>

                                <Input
                                    id="fin_indisponibilite"
                                    name="fin_indisponibilite"
                                    type="datetime-local"
                                    value={
                                        form.fin_indisponibilite
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                />
                            </div>
                        </div>

                        {/* Chef de mission */}

                        <div className="space-y-2">
                            <Label htmlFor="chef_mission">
                                Chef de mission
                            </Label>

                            <Input
                                id="chef_mission"
                                name="chef_mission"
                                value={
                                    form.chef_mission
                                }
                                onChange={handleChange}
                                placeholder="Nom du chef de mission"
                            />
                        </div>

                        {/* Mission */}

                        <div className="space-y-2">
                            <Label htmlFor="mission">
                                Mission
                            </Label>

                            <Input
                                id="mission"
                                name="mission"
                                value={form.mission}
                                onChange={handleChange}
                                placeholder="Objet de la mission"
                                required
                            />
                        </div>

                        {/* Itinéraire */}

                        <div className="space-y-2">
                            <Label htmlFor="itineraire">
                                Itinéraire
                            </Label>

                            <Textarea
                                id="itineraire"
                                name="itineraire"
                                value={
                                    form.itineraire
                                }
                                onChange={handleChange}
                                placeholder="Ex : Cotonou → Porto-Novo → Cotonou"
                                required
                            />
                        </div>

                        {/* Message API */}

                        {message && (
                            <div
                                className={`rounded-md border p-3 text-sm ${
                                    message.type ===
                                    "success"
                                        ? "border-green-200 bg-green-50 text-green-700"
                                        : "border-red-200 bg-red-50 text-red-700"
                                }`}
                            >
                                {message.text}
                            </div>
                        )}

                        {/* Footer */}

                        <DialogFooter className="flex-col gap-2 sm:flex-row">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    setOpenDialog(
                                        false
                                    )
                                }
                                disabled={submitting}
                            >
                                Annuler
                            </Button>

                            <Button
                                type="submit"
                                disabled={submitting}
                            >
                                {submitting
                                    ? "Envoi..."
                                    : "Envoyer la demande"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </main>
    );
}