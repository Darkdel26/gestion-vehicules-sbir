import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

export async function DELETE(request, { params }) {
    try {
        // Vérification de la session admin
        const cookieStore = await cookies();
        const sessionId = cookieStore.get("admin_session")?.value;

        if (!sessionId) {
            return NextResponse.json(
                { error: "Non authentifié" },
                { status: 401 }
            );
        }

        const session = await prisma.session.findUnique({
            where: {
                id: sessionId,
            },
        });

        if (!session || session.expiresAt <= new Date()) {
            return NextResponse.json(
                { error: "Session invalide ou expirée" },
                { status: 401 }
            );
        }

        const { id, indisponibiliteId } = await params;

        // Vérification du véhicule
        const vehicule = await prisma.vehicule.findUnique({
            where: {
                id,
            },
        });

        if (!vehicule) {
            return NextResponse.json(
                { error: "Véhicule introuvable" },
                { status: 404 }
            );
        }

        // Recherche de l'historique
        const indisponibilite =
            await prisma.indisponibilite.findFirst({
                where: {
                    id: indisponibiliteId,
                    id_vehicule: id,
                },
            });

        if (!indisponibilite) {
            return NextResponse.json(
                {
                    error: "Historique introuvable pour ce véhicule",
                },
                { status: 404 }
            );
        }

        // Suppression
        await prisma.indisponibilite.delete({
            where: {
                id: indisponibiliteId,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Historique supprimé avec succès",
        });
    } catch (error) {
        console.error(
            "DELETE_INDISPONIBILITE_ERROR:",
            error
        );

        return NextResponse.json(
            {
                error: "Impossible de supprimer cet historique",
            },
            { status: 500 }
        );
    }
}