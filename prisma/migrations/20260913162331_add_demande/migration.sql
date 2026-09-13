-- CreateTable
CREATE TABLE "Demande" (
    "id" TEXT NOT NULL,
    "debut_indisponibilite" TIMESTAMP(3) NOT NULL,
    "fin_indisponibilite" TIMESTAMP(3) NOT NULL,
    "chef_mission" TEXT,
    "mission" TEXT NOT NULL,
    "itineraire" TEXT NOT NULL,

    CONSTRAINT "Demande_pkey" PRIMARY KEY ("id")
);
