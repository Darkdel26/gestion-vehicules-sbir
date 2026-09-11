import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const chauffeurs = await prisma.chauffeur.findMany({
            orderBy: [
                {
                    nom: "asc",
                },
                {
                    prenom: "asc",
                },
            ],
        });

        return NextResponse.json({
            success: true,
            data: chauffeurs,
        });
    } catch (error) {
        console.error("GET_CHAUFFEURS_ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Impossible de récupérer les chauffeurs.",
            },
            {
                status: 500,
            }
        );
    }
}

/**
 * POST
 * Créer un chauffeur
 */
export async function POST(request) {
    try {
        const body = await request.json();

        const nom = body?.nom?.trim();
        const prenom = body?.prenom?.trim();

        if (!nom) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Le nom est obligatoire.",
                },
                { status: 400 }
            );
        }

        if (!prenom) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Le prénom est obligatoire.",
                },
                { status: 400 }
            );
        }

        const chauffeur = await prisma.chauffeur.create({
            data: {
                nom,
                prenom,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Chauffeur créé avec succès.",
                data: chauffeur,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error(
            "CREATE_CHAUFFEUR_API_ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Impossible de créer le chauffeur.",
            },
            { status: 500 }
        );
    }
}
