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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    AlertCircle,
    ArrowLeft,
    Loader2,
    Save,
    Pencil,
} from "lucide-react";

export default function EditChauffeurPage() {
    const router = useRouter();
    const params = useParams();

    const id = params?.id;

    const [nom, setNom] = useState("");
    const [prenom, setPrenom] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    /**
     * Récupération du chauffeur
     */
    useEffect(() => {
        if (!id) {
            return;
        }

        let isMounted = true;

        const loadDriver = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `/api/chauffeurs/${id}`,
                    {
                        cache: "no-store",
                    }
                );

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(
                        result.message ||
                            "Impossible de récupérer le chauffeur."
                    );
                }

                if (isMounted) {
                    setNom(result.data.nom || "");
                    setPrenom(result.data.prenom || "");
                }
            } catch (error) {
                console.error(
                    "LOAD_DRIVER_ERROR:",
                    error
                );

                if (isMounted) {
                    setError(
                        error.message ||
                            "Impossible de récupérer le chauffeur."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadDriver();

        return () => {
            isMounted = false;
        };
    }, [id]);

    /**
     * Modification
     */
    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        const cleanNom = nom.trim();
        const cleanPrenom = prenom.trim();

        if (!cleanNom) {
            setError("Le nom est obligatoire.");
            return;
        }

        if (!cleanPrenom) {
            setError("Le prénom est obligatoire.");
            return;
        }

        try {
            setSaving(true);

            const response = await fetch(
                `/api/chauffeurs/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        nom: cleanNom,
                        prenom: cleanPrenom,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ||
                        "Impossible de modifier le chauffeur."
                );
            }

            router.push("/administrative-vehicle-drivers");
            router.refresh();
        } catch (error) {
            console.error(
                "UPDATE_DRIVER_ERROR:",
                error
            );

            setError(
                error.message ||
                    "Impossible de modifier le chauffeur."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="w-full min-w-0 space-y-5 sm:space-y-6">

            {/* Breadcrumb */}
            <Breadcrumb>
                <BreadcrumbList className="flex-nowrap overflow-x-auto">
                    <BreadcrumbItem>
                        Administration
                    </BreadcrumbItem>

                    <BreadcrumbSeparator />

                    <BreadcrumbItem>
                        <Link
                            href="/administrative-vehicle-drivers"
                            className="text-muted-foreground hover:text-foreground"
                        >
                            CVA
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

            {/* Chargement */}
            {loading && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Chargement...
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                            <div className="h-11 w-full animate-pulse rounded-md bg-muted" />
                        </div>

                        <div className="space-y-2">
                            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                            <div className="h-11 w-full animate-pulse rounded-md bg-muted" />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Erreur de chargement */}
            {!loading && error && !nom && !prenom && (
                <div
                    className="
                        flex
                        items-start
                        gap-2
                        rounded-lg
                        border
                        border-destructive/30
                        bg-destructive/10
                        p-4
                        text-sm
                        text-destructive
                    "
                >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                    <span>
                        {error}
                    </span>
                </div>
            )}

            {/* Formulaire */}
            {!loading && (nom || prenom || !error) && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Informations du chauffeur
                        </CardTitle>

                        <CardDescription>
                            Modifiez le nom et le prénom.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >

                            {/* Erreur */}
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
                                    "
                                >
                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                                    <span>
                                        {error}
                                    </span>
                                </div>
                            )}

                            {/* Nom */}
                            <div className="space-y-2">
                                <Label htmlFor="nom">
                                    Nom
                                </Label>

                                <Input
                                    id="nom"
                                    name="nom"
                                    value={nom}
                                    onChange={(event) =>
                                        setNom(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Ex. DUPONT"
                                    autoComplete="family-name"
                                    disabled={saving}
                                    className="h-11"
                                />
                            </div>

                            {/* Prénom */}
                            <div className="space-y-2">
                                <Label htmlFor="prenom">
                                    Prénom
                                </Label>

                                <Input
                                    id="prenom"
                                    name="prenom"
                                    value={prenom}
                                    onChange={(event) =>
                                        setPrenom(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Ex. Jean"
                                    autoComplete="given-name"
                                    disabled={saving}
                                    className="h-11"
                                />
                            </div>

                            {/* Actions */}
                            <div
                                className="
                                    flex
                                    flex-col-reverse
                                    gap-2
                                    border-t
                                    pt-6
                                    sm:flex-row
                                    sm:justify-end
                                "
                            >
                                <Button
                                    type="button"
                                    variant="outline"
                                    asChild
                                    disabled={saving}
                                    className="w-full sm:w-auto"
                                >
                                    <Link href="/administrative-vehicle-drivers">
                                        Annuler
                                    </Link>
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full sm:w-auto"
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
                    </CardContent>
                </Card>
            )}

        </div>
    );
}