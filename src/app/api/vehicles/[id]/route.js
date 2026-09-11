import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request,
    { params }
) {
    try {
        const { id } = await params;

        const vehicle =
            await prisma.vehicule.findUnique({
                where: {
                    id,
                },
                select: {
                    id: true,
                    designation: true,
                    matricule: true,
                    etat: true,
                    bloquage: true,
                },
            });

        if (!vehicle) {
            return NextResponse.json(
                {
                    error:
                        "Véhicule introuvable.",
                },
                {
                    status: 404,
                }
            );
        }

        return NextResponse.json(
            vehicle
        );
    } catch (error) {
        console.error(
            "GET_VEHICLE_API_ERROR:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "Impossible de récupérer le véhicule.",
            },
            {
                status: 500,
            }
        );
    }
}

export async function PUT(
    request,
    { params }
) {
    try {
        const { id } = await params;

        const body = await request.json();

        const designation =
            typeof body.designation === "string"
                ? body.designation.trim()
                : "";

        const matricule =
            typeof body.matricule === "string"
                ? body.matricule.trim().toUpperCase()
                : "";

        // Validation
        if (!designation) {
            return NextResponse.json(
                {
                    error:
                        "La désignation est obligatoire.",
                },
                {
                    status: 400,
                }
            );
        }

        if (!matricule) {
            return NextResponse.json(
                {
                    error:
                        "Le matricule est obligatoire.",
                },
                {
                    status: 400,
                }
            );
        }

        // Vérifier que le véhicule existe
        const existingVehicle =
            await prisma.vehicule.findUnique({
                where: {
                    id,
                },
            });

        if (!existingVehicle) {
            return NextResponse.json(
                {
                    error:
                        "Véhicule introuvable.",
                },
                {
                    status: 404,
                }
            );
        }

        // Vérifier que le matricule
        // n'appartient pas à un autre véhicule
        const matriculeVehicle =
            await prisma.vehicule.findFirst({
                where: {
                    matricule,
                    NOT: {
                        id,
                    },
                },
            });

        if (matriculeVehicle) {
            return NextResponse.json(
                {
                    error:
                        "Un autre véhicule avec ce matricule existe déjà.",
                },
                {
                    status: 409,
                }
            );
        }

        const vehicle =
            await prisma.vehicule.update({
                where: {
                    id,
                },
                data: {
                    designation,
                    matricule,
                },
            });

        return NextResponse.json(
            vehicle
        );
    } catch (error) {
        console.error(
            "UPDATE_VEHICLE_API_ERROR:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "Impossible de modifier le véhicule.",
            },
            {
                status: 500,
            }
        );
    }
}

export async function DELETE(
    request,
    { params }
) {
    try {
        const { id } = await params;

        const vehicle =
            await prisma.vehicule.findUnique({
                where: {
                    id,
                },
                include: {
                    indisponibilites: true,
                },
            });

        if (!vehicle) {
            return NextResponse.json(
                {
                    error:
                        "Véhicule introuvable.",
                },
                {
                    status: 404,
                }
            );
        }

        // Protection : ne pas supprimer
        // un véhicule ayant un historique
        if (
            vehicle.indisponibilites.length > 0
        ) {
            return NextResponse.json(
                {
                    error:
                        "Impossible de supprimer ce véhicule car il possède un historique d'indisponibilités.",
                },
                {
                    status: 409,
                }
            );
        }

        await prisma.vehicule.delete({
            where: {
                id,
            },
        });

        return NextResponse.json({
            success: true,
            message:
                "Véhicule supprimé avec succès.",
        });
    } catch (error) {
        console.error(
            "DELETE_VEHICLE_API_ERROR:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "Impossible de supprimer le véhicule.",
            },
            {
                status: 500,
            }
        );
    }
}