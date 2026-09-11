import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Doit correspondre à l'enum Prisma `Departement`
const DEPARTEMENTS_VALIDES = ["DAF", "DT", "DG"];

export async function POST(request) {
    try {
        const body = await request.json();

        const {
            id_vehicule,
            chauffeurId,
            debut_indisponibilite,
            fin_indisponibilite,
            itineraire,
            motif,
            departement,
            chef_mission,
        } = body;

        // ==========================================
        // 1. Vérification des champs obligatoires
        // ==========================================

        if (
            !id_vehicule ||
            !chauffeurId ||
            !debut_indisponibilite ||
            !fin_indisponibilite ||
            !itineraire ||
            !motif
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Tous les champs obligatoires doivent être renseignés.",
                },
                { status: 400 }
            );
        }

        // ==========================================
        // 2. Vérification du département
        // ==========================================

        if (
            departement !== undefined &&
            departement !== null &&
            !DEPARTEMENTS_VALIDES.includes(departement)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Le département est invalide. Valeurs acceptées : ${DEPARTEMENTS_VALIDES.join(
                        ", "
                    )}.`,
                },
                { status: 400 }
            );
        }

        // ==========================================
        // 3. Conversion et validation des dates
        // ==========================================

        const debut = new Date(debut_indisponibilite);
        const fin = new Date(fin_indisponibilite);
        const maintenant = new Date();

        if (
            Number.isNaN(debut.getTime()) ||
            Number.isNaN(fin.getTime())
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Les dates fournies sont invalides.",
                },
                { status: 400 }
            );
        }

        if (debut < maintenant) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "La date de début ne peut pas être dans le passé.",
                },
                { status: 400 }
            );
        }

        if (fin <= debut) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "La date de fin doit être postérieure à la date de début.",
                },
                { status: 400 }
            );
        }

        // ==========================================
        // 4. Vérification du véhicule
        // ==========================================

        const vehicule = await prisma.vehicule.findUnique({
            where: {
                id: id_vehicule,
            },
        });

        if (!vehicule) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Le véhicule demandé n'existe pas.",
                },
                { status: 404 }
            );
        }

        // ==========================================
        // 5. Vérification du chauffeur
        // ==========================================

        const chauffeur = await prisma.chauffeur.findUnique({
            where: {
                id: chauffeurId,
            },
        });

        if (!chauffeur) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Le chauffeur demandé n'existe pas.",
                },
                { status: 404 }
            );
        }

        // ==========================================
        // 6. Vérification de l'indisponibilité
        //    du véhicule
        // ==========================================

        const conflitVehicule =
            await prisma.indisponibilite.findFirst({
                where: {
                    id_vehicule,

                    // Chevauchement :
                    // début existant < fin demandée
                    debut_indisponibilite: {
                        lt: fin,
                    },

                    // fin existante > début demandé
                    fin_indisponibilite: {
                        gt: debut,
                    },
                },

                orderBy: {
                    fin_indisponibilite: "asc",
                },
            });

        if (conflitVehicule) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Le véhicule est déjà affecté pendant cette période. Il sera disponible à partir du ${conflitVehicule.fin_indisponibilite.toLocaleString(
                        "fr-FR"
                    )}.`,

                    conflit: {
                        debut:
                            conflitVehicule.debut_indisponibilite,

                        fin:
                            conflitVehicule.fin_indisponibilite,
                    },
                },
                { status: 409 }
            );
        }

        // ==========================================
        // 7. Vérification de l'indisponibilité
        //    du chauffeur sélectionné
        // ==========================================

        const conflitChauffeur =
            await prisma.indisponibilite.findFirst({
                where: {
                    chauffeurId,

                    debut_indisponibilite: {
                        lt: fin,
                    },

                    fin_indisponibilite: {
                        gt: debut,
                    },
                },

                orderBy: {
                    fin_indisponibilite: "asc",
                },
            });

        if (conflitChauffeur) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Ce chauffeur est déjà affecté pendant cette période. Il sera disponible à partir du ${conflitChauffeur.fin_indisponibilite.toLocaleString(
                        "fr-FR"
                    )}.`,

                    conflit: {
                        debut:
                            conflitChauffeur.debut_indisponibilite,

                        fin:
                            conflitChauffeur.fin_indisponibilite,
                    },
                },
                { status: 409 }
            );
        }

        // ==========================================
        // 8. Recherche des chauffeurs déjà
        //    indisponibles sur cette période
        // ==========================================

        const chauffeursIndisponibles =
            await prisma.indisponibilite.findMany({
                where: {
                    debut_indisponibilite: {
                        lt: fin,
                    },

                    fin_indisponibilite: {
                        gt: debut,
                    },
                },

                select: {
                    chauffeurId: true,
                },

                // Un chauffeur ne doit compter qu'une seule fois
                // même s'il possède plusieurs indisponibilités
                // qui chevauchent la période.
                distinct: ["chauffeurId"],
            });

        const nombreChauffeursIndisponibles =
            chauffeursIndisponibles.length;

        // ==========================================
        // 9. Nombre total de chauffeurs
        // ==========================================

        const totalChauffeurs =
            await prisma.chauffeur.count();

        const nombreChauffeursDisponibles =
            totalChauffeurs -
            nombreChauffeursIndisponibles;

        // ==========================================
        // 10. RÈGLE MÉTIER
        //
        // 0 chauffeur indisponible
        // => DAF / DT / DG autorisés
        //
        // 1 chauffeur indisponible
        // => DAF / DT / DG autorisés
        //
        // 2 chauffeurs indisponibles ou plus
        // => DG uniquement
        //
        // Donc :
        //
        // >= 2 + DAF => REFUS
        // >= 2 + DT  => REFUS
        // >= 2 + DG  => AUTORISÉ
        // ==========================================

        if (
            nombreChauffeursIndisponibles >= 2 &&
            departement !== "DG"
        ) {
            return NextResponse.json(
                {
                    success: false,

                    message:
                        `Allocation impossible : ${nombreChauffeursIndisponibles} chauffeurs sont déjà indisponibles pendant cette période. Une nouvelle allocation est uniquement autorisée pour le département DG.`,

                    details: {
                        total_chauffeurs:
                            totalChauffeurs,

                        chauffeurs_indisponibles:
                            nombreChauffeursIndisponibles,

                        chauffeurs_disponibles:
                            nombreChauffeursDisponibles,

                        departement:

                            departement,

                        departement_autorise:
                            "DG",
                    },
                },
                { status: 409 }
            );
        }

        // ==========================================
        // 11. Création de l'indisponibilité
        // ==========================================

        const indisponibilite =
            await prisma.indisponibilite.create({
                data: {
                    id_vehicule,

                    chauffeurId,

                    debut_indisponibilite: debut,

                    fin_indisponibilite: fin,

                    itineraire:
                        itineraire.trim(),

                    motif:
                        motif.trim(),

                    departement:
                        departement !== undefined &&
                            departement !== null
                            ? departement
                            : null,

                    chef_mission:
                        chef_mission !== undefined &&
                            chef_mission !== null &&
                            chef_mission.trim() !== ""
                            ? chef_mission.trim()
                            : null,
                },

                include: {
                    vehicule: true,

                    chauffeur: true,
                },
            });

        // ==========================================
        // 12. Mise à jour de l'état du véhicule
        // ==========================================

        await prisma.vehicule.update({
            where: {
                id: id_vehicule,
            },

            data: {
                etat: "Indisponible",
            },
        });

        // ==========================================
        // 13. Mise à jour de l'état du chauffeur
        // ==========================================

        await prisma.chauffeur.update({
            where: {
                id: chauffeurId,
            },

            data: {
                etat: "Indisponible",
            },
        });

        // ==========================================
        // 14. Réponse
        // ==========================================

        return NextResponse.json(
            {
                success: true,

                message:
                    "Le véhicule a été affecté avec succès.",

                data: indisponibilite,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error(
            "CREATE_AFFECTATION_ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,

                message:
                    "Une erreur est survenue lors de l'affectation du véhicule.",
            },
            { status: 500 }
        );
    }
}
