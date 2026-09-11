"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Search,
    Car,
    AlertCircle,
    History,
    Calendar,
    MapPin,
    FileText,
    UserRound,
    Building2,
    Trash2,
    Loader2,
    Pencil,
    Plus,
} from "lucide-react";

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =====================================================
    // HISTORIQUE
    // =====================================================

    const [selectedVehicle, setSelectedVehicle] =
        useState(null);

    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] =
        useState(false);

    const [historyError, setHistoryError] = useState("");

    // =====================================================
    // SUPPRESSION HISTORIQUE
    // =====================================================

    const [selectedHistory, setSelectedHistory] =
        useState(null);

    const [deletingHistoryId, setDeletingHistoryId] =
        useState(null);

    const [deleteHistoryError, setDeleteHistoryError] =
        useState("");

    // =====================================================
    // SUPPRESSION VÉHICULE
    // =====================================================

    const [selectedVehicleToDelete, setSelectedVehicleToDelete] =
        useState(null);

    const [deletingVehicleId, setDeletingVehicleId] =
        useState(null);

    const [deleteVehicleError, setDeleteVehicleError] =
        useState("");

    // =====================================================
    // CHARGEMENT DES VÉHICULES
    // =====================================================

    useEffect(() => {
        let isMounted = true;

        const loadVehicles = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    "/api/vehicles",
                    {
                        cache: "no-store",
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Impossible de récupérer les véhicules"
                    );
                }

                const data = await response.json();

                if (isMounted) {
                    setVehicles(data);
                }
            } catch (error) {
                console.error(
                    "LOAD_VEHICLES_ERROR:",
                    error
                );

                if (isMounted) {
                    setError(
                        "Impossible de charger les véhicules."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadVehicles();

        const interval = setInterval(() => {
            loadVehicles();
        }, 30 * 1000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    // =====================================================
    // FILTRAGE DES VÉHICULES
    // =====================================================

    const filteredVehicles = useMemo(() => {
        const value = search.trim().toLowerCase();

        if (!value) {
            return vehicles;
        }

        return vehicles.filter((vehicle) =>
            vehicle.designation
                ?.toLowerCase()
                .includes(value) ||
            vehicle.matricule
                ?.toLowerCase()
                .includes(value) ||
            vehicle.etat
                ?.toLowerCase()
                .includes(value)
        );
    }, [vehicles, search]);

    // =====================================================
    // OUVRIR HISTORIQUE
    // =====================================================

    const handleOpenHistory = async (vehicle) => {
        setSelectedVehicle(vehicle);
        setHistory([]);
        setHistoryError("");
        setHistoryLoading(true);

        try {
            const response = await fetch(
                `/api/vehicles/${vehicle.id}/indisponibilites`,
                {
                    cache: "no-store",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Impossible de récupérer l'historique"
                );
            }

            setHistory(data);
        } catch (error) {
            console.error(
                "LOAD_HISTORY_ERROR:",
                error
            );

            setHistoryError(
                error.message ||
                "Impossible de récupérer l'historique."
            );
        } finally {
            setHistoryLoading(false);
        }
    };

    // =====================================================
    // FERMER HISTORIQUE
    // =====================================================

    const handleCloseHistory = () => {
        if (deletingHistoryId) {
            return;
        }

        setSelectedVehicle(null);
        setHistory([]);
        setHistoryError("");
    };

    // =====================================================
    // SUPPRESSION HISTORIQUE
    // =====================================================

    const handleAskDeleteHistory = (item) => {
        setDeleteHistoryError("");
        setSelectedHistory(item);
    };

    const handleCloseDeleteHistory = () => {
        if (deletingHistoryId) {
            return;
        }

        setSelectedHistory(null);
        setDeleteHistoryError("");
    };

    const handleDeleteHistory = async () => {
        if (
            !selectedHistory ||
            !selectedVehicle
        ) {
            return;
        }

        const historyId = selectedHistory.id;

        try {
            setDeletingHistoryId(historyId);
            setDeleteHistoryError("");

            const response = await fetch(
                `/api/vehicles/${selectedVehicle.id}/indisponibilites/${historyId}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Impossible de supprimer cet historique"
                );
            }

            setHistory((currentHistory) =>
                currentHistory.filter(
                    (item) =>
                        item.id !== historyId
                )
            );

            setSelectedHistory(null);
        } catch (error) {
            console.error(
                "DELETE_HISTORY_ERROR:",
                error
            );

            setDeleteHistoryError(
                error.message ||
                "Impossible de supprimer cet historique."
            );
        } finally {
            setDeletingHistoryId(null);
        }
    };

    // =====================================================
    // SUPPRESSION VÉHICULE
    // =====================================================

    const handleAskDeleteVehicle = (
        event,
        vehicle
    ) => {
        event.stopPropagation();

        setDeleteVehicleError("");
        setSelectedVehicleToDelete(vehicle);
    };

    const handleCloseDeleteVehicle = () => {
        if (deletingVehicleId) {
            return;
        }

        setSelectedVehicleToDelete(null);
        setDeleteVehicleError("");
    };

    const handleDeleteVehicle = async () => {
        if (!selectedVehicleToDelete) {
            return;
        }

        const vehicleId =
            selectedVehicleToDelete.id;

        try {
            setDeletingVehicleId(vehicleId);
            setDeleteVehicleError("");

            const response = await fetch(`/api/vehicles/${vehicleId}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Impossible de supprimer ce véhicule."
                );
            }

            // Retirer immédiatement le véhicule
            // de la liste
            setVehicles((currentVehicles) =>
                currentVehicles.filter(
                    (vehicle) =>
                        vehicle.id !== vehicleId
                )
            );

            // Fermer la confirmation
            setSelectedVehicleToDelete(null);
        } catch (error) {
            console.error(
                "DELETE_VEHICLE_ERROR:",
                error
            );

            setDeleteVehicleError(
                error.message ||
                "Impossible de supprimer ce véhicule."
            );
        } finally {
            setDeletingVehicleId(null);
        }
    };

    // =====================================================
    // FORMATAGE DES DATES
    // =====================================================

    const formatDate = (date) => {
        return new Date(date).toLocaleString(
            "fr-FR",
            {
                dateStyle: "short",
                timeStyle: "short",
            }
        );
    };

    return (
        <div className="space-y-6">
            {/* =====================================================
                BREADCRUMB
            ====================================================== */}

            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        Administration
                    </BreadcrumbItem>

                    <BreadcrumbSeparator />

                    <BreadcrumbItem>
                        <BreadcrumbPage>
                            Véhicules
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* =====================================================
                HEADER
            ====================================================== */}

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Car className="h-6 w-6" />

                        <h1 className="text-2xl font-semibold">
                            Véhicules
                        </h1>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Consultez et gérez les véhicules
                        enregistrés.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    {/* Recherche */}
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                        <Input
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder="Rechercher un véhicule..."
                            className="pl-9"
                        />
                    </div>

                    {/* Créer */}
                    <Button asChild>
                        <Link href="/vehicles/create" className="flex items-center">
                            <Plus className="mr-2 h-4 w-4" />
                            Nouveau véhicule
                        </Link>
                    </Button>
                </div>
            </div>

            {/* =====================================================
                ERREUR
            ====================================================== */}

            {error && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />

                    {error}
                </div>
            )}

            {/* =====================================================
                LOADING
            ====================================================== */}

            {loading && (
                <div className="space-y-3">
                    {Array.from({
                        length: 5,
                    }).map((_, index) => (
                        <div
                            key={index}
                            className="rounded-lg border p-4"
                        >
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-40" />
                                    <Skeleton className="h-4 w-28" />
                                </div>

                                <Skeleton className="h-6 w-24" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* =====================================================
                LISTE
            ====================================================== */}

            {!loading && !error && (
                <>
                    {filteredVehicles.length ===
                        0 ? (
                        <div className="rounded-lg border border-dashed p-10 text-center">
                            <Car className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

                            <p className="font-medium">
                                {search
                                    ? "Aucun véhicule trouvé"
                                    : "Aucun véhicule enregistré"}
                            </p>

                            {search ? (
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Essayez une autre recherche.
                                </p>
                            ) : (
                                <Button
                                    asChild
                                    className="mt-4"
                                >
                                    <Link href="/vehicles/create">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Ajouter un véhicule
                                    </Link>
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-lg border">
                            {/* En-tête */}
                            <div className="grid grid-cols-12 border-b bg-muted/50 px-4 py-3 text-sm font-medium">
                                <div className="col-span-4">
                                    Désignation
                                </div>

                                <div className="col-span-2">
                                    Matricule
                                </div>

                                <div className="col-span-2">
                                    État
                                </div>

                                <div className="col-span-2 text-right">
                                    Historique
                                </div>

                                <div className="col-span-2 text-right">
                                    Actions
                                </div>
                            </div>

                            {/* Véhicules */}
                            {filteredVehicles.map(
                                (vehicle) => (
                                    <div
                                        key={
                                            vehicle.id
                                        }
                                        onClick={() =>
                                            handleOpenHistory(
                                                vehicle
                                            )
                                        }
                                        className="grid grid-cols-12 cursor-pointer items-center border-b px-4 py-4 text-sm last:border-b-0 hover:bg-muted/30"
                                    >
                                        {/* Désignation */}
                                        <div className="col-span-4 font-medium">
                                            {
                                                vehicle.designation
                                            }
                                        </div>

                                        {/* Matricule */}
                                        <div className="col-span-2 text-muted-foreground">
                                            {
                                                vehicle.matricule
                                            }
                                        </div>

                                        {/* État */}
                                        <div className="col-span-2">
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
                                        </div>

                                        {/* Historique */}
                                        <div className="col-span-2 flex justify-end">
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <History className="h-4 w-4" />

                                                <span className="hidden md:inline">
                                                    Voir
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div
                                            className="col-span-2 flex justify-end"
                                            onClick={(event) =>
                                                event.stopPropagation()
                                            }
                                        >
                                            <div className="flex items-center gap-1">
                                                {/* Modifier */}
                                                <Button
                                                    asChild
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Modifier"
                                                >
                                                    <Link
                                                        href={`/vehicles/${vehicle.id}/edit`}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                        <span className="sr-only">
                                                            Modifier{" "}
                                                            {
                                                                vehicle.designation
                                                            }
                                                        </span>
                                                    </Link>
                                                </Button>

                                                {/* Supprimer */}
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Supprimer"
                                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                    onClick={(
                                                        event
                                                    ) =>
                                                        handleAskDeleteVehicle(
                                                            event,
                                                            vehicle
                                                        )
                                                    }
                                                    disabled={
                                                        !!deletingVehicleId
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />

                                                    <span className="sr-only">
                                                        Supprimer{" "}
                                                        {
                                                            vehicle.designation
                                                        }
                                                    </span>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </>
            )}

            {/* =====================================================
                MODAL HISTORIQUE
            ====================================================== */}

            <Dialog
                open={!!selectedVehicle}
                onOpenChange={(open) => {
                    if (!open) {
                        handleCloseHistory();
                    }
                }}
            >
                <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <History className="h-5 w-5" />

                            Historique des indisponibilités
                        </DialogTitle>

                        <DialogDescription>
                            {
                                selectedVehicle?.designation
                            }{" "}
                            —{" "}
                            {
                                selectedVehicle?.matricule
                            }
                        </DialogDescription>
                    </DialogHeader>

                    {/* Chargement */}
                    {historyLoading && (
                        <div className="space-y-3">
                            {Array.from({
                                length: 3,
                            }).map((_, index) => (
                                <div
                                    key={index}
                                    className="rounded-lg border p-4"
                                >
                                    <Skeleton className="h-5 w-48" />

                                    <Skeleton className="mt-3 h-4 w-64" />

                                    <Skeleton className="mt-2 h-4 w-56" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Erreur */}
                    {!historyLoading &&
                        historyError && (
                            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                                <AlertCircle className="h-4 w-4" />

                                {historyError}
                            </div>
                        )}

                    {/* Aucun historique */}
                    {!historyLoading &&
                        !historyError &&
                        history.length === 0 && (
                            <div className="py-10 text-center">
                                <History className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

                                <p className="font-medium">
                                    Aucun historique
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Ce véhicule
                                    n'a aucune
                                    indisponibilité
                                    enregistrée.
                                </p>
                            </div>
                        )}

                    {/* Historique */}
                    {!historyLoading &&
                        !historyError &&
                        history.length > 0 && (
                            <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-2">
                                {history.map(
                                    (item) => (
                                        <div
                                            key={
                                                item.id
                                            }
                                            className="rounded-lg border p-4"
                                        >
                                            {/* Itinéraire */}
                                            <div className="flex items-start gap-3">
                                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                                                <div>
                                                    <p className="font-medium">
                                                        {
                                                            item.itineraire
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Dates */}
                                            <div className="mt-3 flex items-start gap-3">
                                                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                                                <div className="text-sm text-muted-foreground">
                                                    <p>
                                                        Début
                                                        :{" "}
                                                        {formatDate(
                                                            item.debut_indisponibilite
                                                        )}
                                                    </p>

                                                    <p>
                                                        Fin
                                                        :{" "}
                                                        {formatDate(
                                                            item.fin_indisponibilite
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Motif */}
                                            <div className="mt-3 flex items-start gap-3">
                                                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                                                <p className="text-sm text-muted-foreground">
                                                    {
                                                        item.motif
                                                    }
                                                </p>
                                            </div>

                                            {/* Département */}
                                            <div className="mt-3 flex items-start gap-3">
                                                <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                                                <p className="text-sm text-muted-foreground">
                                                    {
                                                        item.departement ||
                                                        "Non renseigné"
                                                    }
                                                </p>
                                            </div>

                                            {/* Chauffeur */}
                                            <div className="mt-3 flex items-start gap-3">
                                                <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                                                <div className="text-sm">
                                                    <p className="font-medium">
                                                        Chauffeur
                                                        à
                                                        bord
                                                    </p>

                                                    <p className="font-semibold text-foreground">
                                                        {item.chauffeur
                                                            ? `${item.chauffeur.prenom} ${item.chauffeur.nom}`
                                                            : "Non renseigné"}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Chef de mission */}
                                            <div className="mt-3 flex items-start gap-3">
                                                <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                                                <div className="text-sm">
                                                    <p className="font-medium">
                                                        Chef
                                                        de
                                                        mission
                                                    </p>

                                                    <p className="text-muted-foreground">
                                                        {item.chef_mission ||
                                                            "Non renseigné"}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Suppression */}
                                            <div className="mt-4 flex justify-end border-t pt-3">
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleAskDeleteHistory(
                                                            item
                                                        )
                                                    }
                                                    disabled={
                                                        !!deletingHistoryId
                                                    }
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />

                                                    Supprimer
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                </DialogContent>
            </Dialog>

            {/* =====================================================
                MODAL CONFIRMATION SUPPRESSION HISTORIQUE
            ====================================================== */}

            <Dialog
                open={!!selectedHistory}
                onOpenChange={(open) => {
                    if (!open) {
                        handleCloseDeleteHistory();
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Trash2 className="h-5 w-5 text-destructive" />

                            Supprimer l'historique ?
                        </DialogTitle>

                        <DialogDescription>
                            Cette action est irréversible.
                            L'enregistrement sera
                            définitivement supprimé.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedHistory && (
                        <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                            <div>
                                <span className="font-medium">
                                    Itinéraire :
                                </span>{" "}
                                {
                                    selectedHistory.itineraire
                                }
                            </div>

                            <div className="mt-2">
                                <span className="font-medium">
                                    Chauffeur :
                                </span>{" "}
                                {selectedHistory.chauffeur
                                    ? `${selectedHistory.chauffeur.prenom} ${selectedHistory.chauffeur.nom}`
                                    : "Non renseigné"}
                            </div>

                            <div className="mt-2">
                                <span className="font-medium">
                                    Motif :
                                </span>{" "}
                                {
                                    selectedHistory.motif
                                }
                            </div>
                        </div>
                    )}

                    {deleteHistoryError && (
                        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                            <AlertCircle className="h-4 w-4 shrink-0" />

                            {deleteHistoryError}
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={
                                handleCloseDeleteHistory
                            }
                            disabled={
                                !!deletingHistoryId
                            }
                        >
                            Annuler
                        </Button>

                        <Button
                            type="button"
                            variant="destructive"
                            onClick={
                                handleDeleteHistory
                            }
                            disabled={
                                !!deletingHistoryId
                            }
                        >
                            {deletingHistoryId ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                                    Suppression...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="mr-2 h-4 w-4" />

                                    Supprimer
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* =====================================================
                MODAL CONFIRMATION SUPPRESSION VÉHICULE
            ====================================================== */}

            <Dialog
                open={!!selectedVehicleToDelete}
                onOpenChange={(open) => {
                    if (!open) {
                        handleCloseDeleteVehicle();
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Trash2 className="h-5 w-5 text-destructive" />

                            Supprimer le véhicule ?
                        </DialogTitle>

                        <DialogDescription>
                            Cette action est irréversible.
                            Le véhicule sera définitivement
                            supprimé.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Informations du véhicule */}
                    {selectedVehicleToDelete && (
                        <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                            <div>
                                <span className="font-medium">
                                    Désignation :
                                </span>{" "}
                                {
                                    selectedVehicleToDelete.designation
                                }
                            </div>

                            <div className="mt-2">
                                <span className="font-medium">
                                    Matricule :
                                </span>{" "}
                                {
                                    selectedVehicleToDelete.matricule
                                }
                            </div>

                            <div className="mt-2">
                                <span className="font-medium">
                                    État :
                                </span>{" "}
                                {
                                    selectedVehicleToDelete.etat
                                }
                            </div>
                        </div>
                    )}

                    {/* Erreur */}
                    {deleteVehicleError && (
                        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                            <AlertCircle className="h-4 w-4 shrink-0" />

                            {deleteVehicleError}
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={
                                handleCloseDeleteVehicle
                            }
                            disabled={
                                !!deletingVehicleId
                            }
                        >
                            Annuler
                        </Button>

                        <Button
                            type="button"
                            variant="destructive"
                            onClick={
                                handleDeleteVehicle
                            }
                            disabled={
                                !!deletingVehicleId
                            }
                        >
                            {deletingVehicleId ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                                    Suppression...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="mr-2 h-4 w-4" />

                                    Supprimer
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}