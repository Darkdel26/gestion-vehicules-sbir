"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, UserRound, AlertCircle, History, Calendar, MapPin, Pencil, Trash2, Plus } from "lucide-react";

export default function ChauffeursPage() {
    const [drivers, setDrivers] = useState([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Historique
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState("");

    // Suppression
    const [driverToDelete, setDriverToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    /**
     * Récupération des chauffeurs
     */
    useEffect(() => {
        let isMounted = true;

        const loadDrivers = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch("/api/chauffeurs", {
                    cache: "no-store",
                });

                if (!response.ok) {
                    throw new Error(
                        "Impossible de récupérer les chauffeurs"
                    );
                }

                const result = await response.json();

                if (!result.success) {
                    throw new Error(
                        result.message ||
                        "Impossible de récupérer les chauffeurs"
                    );
                }

                if (isMounted) {
                    setDrivers(result.data);
                }
            } catch (error) {
                console.error("LOAD_DRIVERS_ERROR:", error);

                if (isMounted) {
                    setError(
                        "Impossible de charger les chauffeurs."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadDrivers();

        const interval = setInterval(() => {
            loadDrivers();
        }, 30 * 1000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    /**
     * Recherche
     */
    const filteredDrivers = useMemo(() => {
        const value = search.trim().toLowerCase();

        if (!value) {
            return drivers;
        }

        return drivers.filter((driver) => {
            return (
                driver.nom?.toLowerCase().includes(value) ||
                driver.prenom?.toLowerCase().includes(value) ||
                driver.etat?.toLowerCase().includes(value)
            );
        });
    }, [drivers, search]);

    /**
     * Ouvre l'historique
     */
    const handleOpenHistory = async (driver) => {
        setSelectedDriver(driver);
        setHistory([]);
        setHistoryError("");
        setHistoryLoading(true);

        try {
            const response = await fetch(`/api/chauffeurs/${driver.id}/indisponibilites`, {
                cache: "no-store",
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ||
                    "Impossible de récupérer l'historique"
                );
            }

            setHistory(result.data);
        } catch (error) {
            console.error(
                "LOAD_DRIVER_HISTORY_ERROR:",
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

    /**
     * Ferme historique
     */
    const handleCloseHistory = () => {
        setSelectedDriver(null);
        setHistory([]);
        setHistoryError("");
    };

    /**
     * Demande confirmation suppression
     */
    const handleAskDelete = (event, driver) => {
        event.preventDefault();
        event.stopPropagation();

        setDeleteError("");
        setDriverToDelete(driver);
    };

    /**
     * Suppression
     */
    const handleDelete = async () => {
        if (!driverToDelete) {
            return;
        }

        try {
            setDeleteLoading(true);
            setDeleteError("");

            const response = await fetch(
                `/api/chauffeurs/${driverToDelete.id}`,
                {
                    method: "DELETE",
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ||
                    "Impossible de supprimer le chauffeur."
                );
            }

            setDrivers((currentDrivers) =>
                currentDrivers.filter(
                    (driver) =>
                        driver.id !== driverToDelete.id
                )
            );

            setDriverToDelete(null);
        } catch (error) {
            console.error("DELETE_DRIVER_ERROR:", error);

            setDeleteError(error.message || "Impossible de supprimer le chauffeur.");
        } finally {
            setDeleteLoading(false);
        }
    };

    /**
     * Ferme suppression
     */
    const handleCloseDelete = () => {
        if (deleteLoading) {
            return;
        }

        setDriverToDelete(null);
        setDeleteError("");
    };

    /**
     * Formatage dates
     */
    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleString("fr-FR", {
            dateStyle: "short",
            timeStyle: "short",
        });
    };

    return (
        <div className="w-full min-w-0 space-y-5 sm:space-y-6">

            {/* =====================================================
                BREADCRUMB
            ====================================================== */}
            <Breadcrumb className="overflow-hidden">
                <BreadcrumbList className="flex-nowrap overflow-x-auto">
                    <BreadcrumbItem>
                        Administration
                    </BreadcrumbItem>

                    <BreadcrumbSeparator />

                    <BreadcrumbItem>
                        <BreadcrumbPage>
                            Chauffeurs
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* =====================================================
                HEADER
            ====================================================== */}
            <div className="space-y-4">

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    {/* Titre */}
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <UserRound className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" />

                            <h1 className="truncate text-xl font-semibold sm:text-2xl">
                                Chauffeurs
                            </h1>
                        </div>

                        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                            Consultez les chauffeurs et leur
                            historique d'indisponibilités.
                        </p>
                    </div>

                    {/* Recherche + création */}
                    <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">

                        {/* Recherche */}
                        <div className="relative w-full sm:min-w-0 sm:flex-1 lg:w-72 lg:flex-none">
                            <Search
                                className="
                                    absolute
                                    left-3
                                    top-1/2
                                    h-4
                                    w-4
                                    -translate-y-1/2
                                    text-muted-foreground
                                "
                            />

                            <Input
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Rechercher..."
                                className="h-10 w-full pl-9"
                            />
                        </div>

                        {/* Créer */}
                        <Button
                            asChild
                            className="h-10 w-full sm:w-auto"
                        >
                            <Link href="/administrative-vehicle-drivers/create" className="flex items-center">
                                <Plus className="mr-2 h-4 w-4" />
                                <span>
                                    Enregistrement
                                </span>
                            </Link>
                        </Button>

                    </div>
                </div>
            </div>

            {/* =====================================================
                ERREUR
            ====================================================== */}
            {error && (
                <div
                    className="
                        flex
                        items-start
                        gap-2
                        rounded-lg
                        border
                        border-destructive/30
                        bg-destructive/10
                        p-3
                        text-sm
                        text-destructive
                        sm:p-4
                    "
                >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                    <span>{error}</span>
                </div>
            )}

            {/* =====================================================
                LOADING
            ====================================================== */}
            {loading && (
                <div className="space-y-3">

                    {Array.from({ length: 5 }).map(
                        (_, index) => (
                            <div
                                key={index}
                                className="rounded-lg border p-4"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="min-w-0 space-y-2">
                                        <Skeleton className="h-5 w-32 sm:w-40" />
                                        <Skeleton className="h-4 w-24 sm:w-28" />
                                    </div>

                                    <Skeleton className="h-6 w-20 sm:w-24" />
                                </div>
                            </div>
                        )
                    )}

                </div>
            )}

            {/* =====================================================
                LISTE
            ====================================================== */}
            {!loading && !error && (
                <>
                    {filteredDrivers.length === 0 ? (
                        <div
                            className="
                                rounded-lg
                                border
                                border-dashed
                                p-6
                                text-center
                                sm:p-10
                            "
                        >
                            <UserRound
                                className="
                                    mx-auto
                                    mb-3
                                    h-8
                                    w-8
                                    text-muted-foreground
                                "
                            />

                            <p className="font-medium">
                                {search
                                    ? "Aucun chauffeur trouvé"
                                    : "Aucun chauffeur enregistré"}
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
                                    <Link href="/administrative-vehicle-drivers/create" className="flex items-center">
                                        <Plus className="mr-2 h-4 w-4" />
                                        <span>Enregistrement</span>
                                    </Link>
                                </Button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* =================================================
                                MOBILE + TABLETTE
                            ================================================== */}
                            <div className="grid grid-cols-1 gap-3 lg:hidden">

                                {filteredDrivers.map(
                                    (driver) => (
                                        <div
                                            key={driver.id}
                                            className="
                                                min-w-0
                                                rounded-xl
                                                border
                                                bg-card
                                                p-4
                                                shadow-sm
                                            "
                                        >

                                            {/* Informations */}
                                            <div className="flex min-w-0 items-start justify-between gap-3">

                                                <div className="min-w-0">
                                                    <p className="truncate text-base font-semibold uppercase">
                                                        {driver.nom}
                                                    </p>

                                                    <p className="mt-1 truncate text-sm text-muted-foreground">
                                                        {driver.prenom}
                                                    </p>
                                                </div>

                                                <Badge
                                                    variant={
                                                        driver.etat ===
                                                            "Disponible"
                                                            ? "default"
                                                            : "secondary"
                                                    }
                                                    className="shrink-0"
                                                >
                                                    {driver.etat}
                                                </Badge>

                                            </div>

                                            {/* Actions */}
                                            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">

                                                {/* Historique */}
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={() =>
                                                        handleOpenHistory(
                                                            driver
                                                        )
                                                    }
                                                >
                                                    <History className="mr-2 h-4 w-4 shrink-0" />

                                                    Historique
                                                </Button>

                                                {/* Modifier */}
                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full"
                                                >
                                                    <Link
                                                        href={`/chauffeurs/${driver.id}/edit`}
                                                    >
                                                        <Pencil className="mr-2 h-4 w-4 shrink-0" />

                                                        Modifier
                                                    </Link>
                                                </Button>

                                                {/* Supprimer */}
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={(event) =>
                                                        handleAskDelete(
                                                            event,
                                                            driver
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4 shrink-0" />

                                                    Supprimer
                                                </Button>

                                            </div>

                                        </div>
                                    )
                                )}

                            </div>

                            {/* =================================================
                                DESKTOP
                            ================================================== */}
                            <div className="hidden overflow-hidden rounded-xl border lg:block">

                                {/* En-tête */}
                                <div
                                    className="
                                        grid
                                        grid-cols-12
                                        items-center
                                        gap-2
                                        border-b
                                        bg-muted/50
                                        px-4
                                        py-3
                                        text-sm
                                        font-medium
                                    "
                                >
                                    <div className="col-span-3">
                                        Nom
                                    </div>

                                    <div className="col-span-2">
                                        Prénom
                                    </div>

                                    <div className="col-span-2">
                                        Disponibilité
                                    </div>

                                    <div className="col-span-2 text-center">
                                        Historique
                                    </div>

                                    <div className="col-span-3 text-right">
                                        Actions
                                    </div>
                                </div>

                                {/* Lignes */}
                                {filteredDrivers.map(
                                    (driver) => (
                                        <div
                                            key={driver.id}
                                            className="
                                                grid
                                                grid-cols-12
                                                items-center
                                                gap-2
                                                border-b
                                                px-4
                                                py-4
                                                text-sm
                                                last:border-b-0
                                                hover:bg-muted/30
                                            "
                                        >

                                            <div className="col-span-3 min-w-0">
                                                <p className="truncate font-medium uppercase">
                                                    {driver.nom}
                                                </p>
                                            </div>

                                            <div className="col-span-2 min-w-0">
                                                <p className="truncate text-muted-foreground">
                                                    {driver.prenom}
                                                </p>
                                            </div>

                                            <div className="col-span-2">
                                                <Badge
                                                    variant={
                                                        driver.etat ===
                                                            "Disponible"
                                                            ? "default"
                                                            : "secondary"
                                                    }
                                                >
                                                    {driver.etat}
                                                </Badge>
                                            </div>

                                            <div className="col-span-2 flex justify-center">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleOpenHistory(
                                                            driver
                                                        )
                                                    }
                                                >
                                                    <History className="mr-1 h-4 w-4" />

                                                    Voir
                                                </Button>
                                            </div>

                                            <div className="col-span-3 flex justify-end gap-2">

                                                <Button
                                                    asChild
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <Link
                                                        href={`/administrative-vehicle-drivers/${driver.id}/edit`}
                                                    >
                                                        <Pencil className="mr-1 h-4 w-4" />
                                                    </Link>
                                                </Button>

                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={(event) =>
                                                        handleAskDelete(
                                                            event,
                                                            driver
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="mr-1 h-4 w-4" />
                                                </Button>

                                            </div>

                                        </div>
                                    )
                                )}

                            </div>
                        </>
                    )}
                </>
            )}

            {/* =====================================================
                MODAL HISTORIQUE
            ====================================================== */}
            <Dialog
                open={!!selectedDriver}
                onOpenChange={(open) => {
                    if (!open) {
                        handleCloseHistory();
                    }
                }}
            >
                <DialogContent
                    className="
                        max-h-[90vh]
                        w-[calc(100%-2rem)]
                        max-w-3xl
                        overflow-hidden
                        rounded-xl
                        p-4
                        sm:p-6
                    "
                >

                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <History className="h-5 w-5 shrink-0" />

                            <span className="truncate">
                                Historique des indisponibilités
                            </span>
                        </DialogTitle>

                        <DialogDescription>
                            <span className="wrap-break-word">
                                {selectedDriver?.nom}{" "}
                                {selectedDriver?.prenom}
                            </span>
                        </DialogDescription>
                    </DialogHeader>

                    {/* Loading */}
                    {historyLoading && (
                        <div className="space-y-3">

                            {Array.from({ length: 3 }).map(
                                (_, index) => (
                                    <div
                                        key={index}
                                        className="rounded-lg border p-4"
                                    >
                                        <Skeleton className="h-5 w-40 sm:w-48" />

                                        <Skeleton className="mt-3 h-4 w-full max-w-64" />

                                        <Skeleton className="mt-2 h-4 w-full max-w-56" />
                                    </div>
                                )
                            )}

                        </div>
                    )}

                    {/* Erreur */}
                    {!historyLoading &&
                        historyError && (
                            <div
                                className="
                                    flex
                                    items-start
                                    gap-2
                                    rounded-lg
                                    border
                                    border-destructive/30
                                    bg-destructive/10
                                    p-3
                                    text-sm
                                    text-destructive
                                    sm:p-4
                                "
                            >
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                                <span className="wrap-break-word">
                                    {historyError}
                                </span>
                            </div>
                        )}

                    {/* Aucun historique */}
                    {!historyLoading &&
                        !historyError &&
                        history.length === 0 && (
                            <div className="py-8 text-center sm:py-10">

                                <History
                                    className="
                                        mx-auto
                                        mb-3
                                        h-8
                                        w-8
                                        text-muted-foreground
                                    "
                                />

                                <p className="font-medium">
                                    Aucun historique
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Ce chauffeur n'a aucune
                                    indisponibilité enregistrée.
                                </p>

                            </div>
                        )}

                    {/* Historique */}
                    {!historyLoading &&
                        !historyError &&
                        history.length > 0 && (
                            <div
                                className="
                                    max-h-[55vh]
                                    space-y-3
                                    overflow-y-auto
                                    pr-1
                                "
                            >
                                {history.map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-lg border p-3 sm:p-4"
                                    >

                                        {/* Itinéraire */}
                                        <div className="flex items-start gap-3">

                                            <MapPin
                                                className="
                                                    mt-0.5
                                                    h-4
                                                    w-4
                                                    shrink-0
                                                    text-muted-foreground
                                                "
                                            />

                                            <p className="min-w-0 wrap-break-word font-medium">
                                                {item.itineraire}
                                            </p>

                                        </div>

                                        {/* Période */}
                                        <div className="mt-3 flex items-start gap-3">

                                            <Calendar
                                                className="
                                                    mt-0.5
                                                    h-4
                                                    w-4
                                                    shrink-0
                                                    text-muted-foreground
                                                "
                                            />

                                            <div className="min-w-0 text-sm text-muted-foreground">
                                                <p>
                                                    Début :{" "}
                                                    {formatDate(
                                                        item.debut_indisponibilite
                                                    )}
                                                </p>

                                                <p>
                                                    Fin :{" "}
                                                    {formatDate(
                                                        item.fin_indisponibilite
                                                    )}
                                                </p>
                                            </div>

                                        </div>

                                    </div>
                                ))}
                            </div>
                        )}

                </DialogContent>
            </Dialog>

            {/* =====================================================
                MODAL CONFIRMATION SUPPRESSION
            ====================================================== */}
            <Dialog
                open={!!driverToDelete}
                onOpenChange={(open) => {
                    if (!open) {
                        handleCloseDelete();
                    }
                }}
            >
                <DialogContent
                    className="
                        w-[calc(100%-2rem)]
                        max-w-md
                        rounded-xl
                        p-4
                        sm:p-6
                    "
                >

                    <DialogHeader>
                        <DialogTitle>
                            Supprimer le chauffeur ?
                        </DialogTitle>

                        <DialogDescription className="wrap-break-word">
                            Vous êtes sur le point de supprimer{" "}
                            <span className="font-medium text-foreground">
                                {driverToDelete?.nom}{" "}
                                {driverToDelete?.prenom}
                            </span>
                            . Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Erreur */}
                    {deleteError && (
                        <div
                            className="
                                flex
                                items-start
                                gap-2
                                rounded-lg
                                border
                                border-destructive/30
                                bg-destructive/10
                                p-3
                                text-sm
                                text-destructive
                            "
                        >
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                            <span className="wrap-break-word">
                                {deleteError}
                            </span>
                        </div>
                    )}

                    <DialogFooter className="flex-col gap-2 sm:flex-row">

                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCloseDelete}
                            disabled={deleteLoading}
                            className="w-full sm:w-auto"
                        >
                            Annuler
                        </Button>

                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteLoading}
                            className="w-full sm:w-auto"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />

                            {deleteLoading
                                ? "Suppression..."
                                : "Supprimer"}
                        </Button>

                    </DialogFooter>

                </DialogContent>
            </Dialog>

        </div>
    );
}