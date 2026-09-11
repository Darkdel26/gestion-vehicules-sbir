import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
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

        const vehicles = await prisma.vehicule.findMany({
            orderBy: {
                designation: "asc",
            },
        });

        return NextResponse.json(vehicles);

    } catch (error) {
        console.error("GET_VEHICULES_ERROR:", error);

        return NextResponse.json(
            {
                error: "Impossible de récupérer les véhicules",
            },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
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

        // Vérification du matricule
        const existingVehicle =
            await prisma.vehicule.findUnique({
                where: {
                    matricule,
                },
            });

        if (existingVehicle) {
            return NextResponse.json(
                {
                    error:
                        "Un véhicule avec ce matricule existe déjà.",
                },
                {
                    status: 409,
                }
            );
        }

        const vehicle =
            await prisma.vehicule.create({
                data: {
                    designation,
                    matricule
                },
            });

        return NextResponse.json(
            vehicle,
            {
                status: 201,
            }
        );
    } catch (error) {
        console.error(
            "CREATE_VEHICLE_API_ERROR:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "Impossible de créer le véhicule.",
            },
            {
                status: 500,
            }
        );
    }
}