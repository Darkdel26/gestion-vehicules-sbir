import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET
 * Récupérer un chauffeur
 */
export async function GET(request, { params }) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Identifiant du chauffeur manquant.",
                },
                { status: 400 }
            );
        }

        const chauffeur =
            await prisma.chauffeur.findUnique({
                where: {
                    id,
                },
            });

        if (!chauffeur) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Chauffeur introuvable.",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: chauffeur,
        });
    } catch (error) {
        console.error(
            "GET_CHAUFFEUR_API_ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Impossible de récupérer le chauffeur.",
            },
            { status: 500 }
        );
    }
}

/**
 * PUT
 * Modifier un chauffeur
 *
 * Seuls nom et prenom sont modifiables.
 */
export async function PUT(request, { params }) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Identifiant du chauffeur manquant.",
                },
                { status: 400 }
            );
        }

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

        const existingDriver =
            await prisma.chauffeur.findUnique({
                where: {
                    id,
                },
            });

        if (!existingDriver) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Chauffeur introuvable.",
                },
                { status: 404 }
            );
        }

        const chauffeur =
            await prisma.chauffeur.update({
                where: {
                    id,
                },
                data: {
                    nom,
                    prenom,
                },
            });

        return NextResponse.json({
            success: true,
            message: "Chauffeur modifié avec succès.",
            data: chauffeur,
        });
    } catch (error) {
        console.error(
            "UPDATE_CHAUFFEUR_API_ERROR:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Impossible de modifier le chauffeur.",
            },
            { status: 500 }
        );
    }
}

/**
 * DELETE
 * Supprimer un chauffeur
 */
export async function DELETE(request, { params }) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Identifiant du chauffeur manquant.",
                },
                { status: 400 }
            );
        }

        const existingDriver =
            await prisma.chauffeur.findUnique({
                where: {
                    id,
                },
            });

        if (!existingDriver) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Chauffeur introuvable.",
                },
                { status: 404 }
            );
        }

        await prisma.chauffeur.delete({
            where: {
                id,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Chauffeur supprimé avec succès.",
        });
    } catch (error) {
        console.error(
            "DELETE_CHAUFFEUR_API_ERROR:",
            error
        );

        /*
         * Si des indisponibilités sont liées au chauffeur
         * et que la relation Prisma interdit la suppression,
         * on renvoie une erreur explicite.
         */
        if (error?.code === "P2003") {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Impossible de supprimer ce chauffeur car il possède des indisponibilités enregistrées.",
                },
                { status: 409 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message:
                    "Impossible de supprimer le chauffeur.",
            },
            { status: 500 }
        );
    }
}
