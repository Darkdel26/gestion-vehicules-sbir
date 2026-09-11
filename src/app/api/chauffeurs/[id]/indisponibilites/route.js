import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Identifiant du chauffeur manquant",
                },
                { status: 400 }
            );
        }

        const chauffeur = await prisma.chauffeur.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
                nom: true,
                prenom: true,
            },
        });

        if (!chauffeur) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Chauffeur introuvable",
                },
                { status: 404 }
            );
        }

        const indisponibilites =
            await prisma.indisponibilite.findMany({
                where: {
                    chauffeurId: id,
                },
                orderBy: {
                    debut_indisponibilite: "desc",
                },
                include: {
                    vehicule: {
                        select: {
                            id: true,
                            designation: true,
                            matricule: true,
                        },
                    },
                },
            });

        return NextResponse.json({
            success: true,
            data: indisponibilites,
        });
    } catch (error) {
        console.error(
            "GET_CHAUFFEUR_INDISPONIBILITES_ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Impossible de récupérer l'historique des indisponibilités",
            },
            { status: 500 }
        );
    }
}