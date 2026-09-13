import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
    try {
        const body = await request.json();

        const {
            vehiculeId,
            debut_indisponibilite,
            fin_indisponibilite,
            chef_mission,
            mission,
            itineraire,
        } = body;

        // ==========================================
        // 1. Vérification des champs obligatoires
        // ==========================================

        if (
            !vehiculeId ||
            !debut_indisponibilite ||
            !fin_indisponibilite ||
            !mission ||
            !itineraire
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
        // 2. Validation des dates
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
        // 3. Vérification du véhicule
        // ==========================================

        const vehicule = await prisma.vehicule.findUnique({
            where: {
                id: vehiculeId,
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
        // 4. Vérification du blocage du véhicule
        // ==========================================

        if (vehicule.bloquage === "Oui") {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Ce véhicule est bloqué et ne peut pas faire l'objet d'une demande.",
                },
                { status: 409 }
            );
        }

        // ==========================================
        // 5. Vérification des indisponibilités
        //    existantes du véhicule
        //
        // Deux périodes se chevauchent si :
        //
        // début existant < fin demandée
        // ET
        // fin existante > début demandée
        // ==========================================

        const conflitIndisponibilite =
            await prisma.indisponibilite.findFirst({
                where: {
                    id_vehicule: vehiculeId,

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

        if (conflitIndisponibilite) {
            return NextResponse.json(
                {
                    success: false,

                    message:
                        `Le véhicule n'est pas disponible pendant cette période. Il est indisponible du ${conflitIndisponibilite.debut_indisponibilite.toLocaleString(
                            "fr-FR"
                        )} au ${conflitIndisponibilite.fin_indisponibilite.toLocaleString(
                            "fr-FR"
                        )}.`,

                    conflit: {
                        debut:
                            conflitIndisponibilite.debut_indisponibilite,

                        fin:
                            conflitIndisponibilite.fin_indisponibilite,
                    },
                },
                { status: 409 }
            );
        }

        // ==========================================
        // 6. Vérification des demandes existantes
        //
        // Une demande déjà enregistrée sur la même
        // période bloque également le véhicule.
        // ==========================================

        const conflitDemande =
            await prisma.demande.findFirst({
                where: {
                    vehiculeId,

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

        if (conflitDemande) {
            return NextResponse.json(
                {
                    success: false,

                    message:
                        `Une demande existe déjà pour ce véhicule pendant cette période. La période demandée est déjà réservée du ${conflitDemande.debut_indisponibilite.toLocaleString(
                            "fr-FR"
                        )} au ${conflitDemande.fin_indisponibilite.toLocaleString(
                            "fr-FR"
                        )}.`,

                    conflit: {
                        debut:
                            conflitDemande.debut_indisponibilite,

                        fin:
                            conflitDemande.fin_indisponibilite,
                    },
                },
                { status: 409 }
            );
        }

        // ==========================================
        // 7. Création de la demande
        // ==========================================

        const demande = await prisma.demande.create({
            data: {
                vehiculeId,

                debut_indisponibilite: debut,

                fin_indisponibilite: fin,

                chef_mission:
                    chef_mission &&
                    chef_mission.trim() !== ""
                        ? chef_mission.trim()
                        : null,

                mission: mission.trim(),

                itineraire: itineraire.trim(),
            },

            include: {
                vehicule: true,
            },
        });

        // ==========================================
        // 8. Réponse
        // ==========================================

        return NextResponse.json(
            {
                success: true,

                message:
                    "La demande a été enregistrée avec succès.",

                data: demande,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error(
            "CREATE_DEMANDE_ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,

                message:
                    "Une erreur est survenue lors de la création de la demande.",
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const demandes = await prisma.demande.findMany({
            orderBy: {
                debut_indisponibilite: "desc",
            },

            include: {
                vehicule: {
                    select: {
                        id: true,
                        designation: true,
                        matricule: true,
                        etat: true,
                        bloquage: true,
                    },
                },
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: demandes,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(
            "GET_DEMANDES_ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Une erreur est survenue lors du chargement des demandes.",
            },
            { status: 500 }
        );
    }
}
