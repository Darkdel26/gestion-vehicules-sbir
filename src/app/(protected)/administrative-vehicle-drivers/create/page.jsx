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
    UserPlus,
} from "lucide-react";

export default function CreateChauffeurPage() {
    const router = useRouter();

    const [nom, setNom] = useState("");
    const [prenom, setPrenom] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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
            setLoading(true);

            const response = await fetch("/api/chauffeurs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nom: cleanNom,
                    prenom: cleanPrenom,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ||
                        "Impossible de créer le chauffeur."
                );
            }

            router.push("/administrative-vehicle-drivers");
            router.refresh();
        } catch (error) {
            console.error(
                "CREATE_DRIVER_ERROR:",
                error
            );

            setError(
                error.message ||
                    "Impossible de créer le chauffeur."
            );
        } finally {
            setLoading(false);
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
                            Nouveau CVA
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Formulaire */}
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>
                        Informations du chauffeur
                    </CardTitle>

                    <CardDescription>
                        Renseignez le nom et le prénom du chauffeur.
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
                                    setNom(event.target.value)
                                }
                                placeholder=""
                                disabled={loading}
                                className="h-11"
                            />
                        </div>

                        {/* Prénom */}
                        <div className="space-y-2">
                            <Label htmlFor="prenom">
                                Prénom(s)
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
                                disabled={loading}
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
                                disabled={loading}
                                className="w-full sm:w-auto"
                            >
                                <Link href="/administrative-vehicle-drivers">
                                    Annuler
                                </Link>
                            </Button>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Création...
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
        </div>
    );
}