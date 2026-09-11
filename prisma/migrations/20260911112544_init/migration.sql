-- CreateEnum
CREATE TYPE "EtatVehicule" AS ENUM ('Disponible', 'Indisponible');

-- CreateEnum
CREATE TYPE "BloquageVehicule" AS ENUM ('Oui', 'Non');

-- CreateEnum
CREATE TYPE "EtatChauffeur" AS ENUM ('Disponible', 'Indisponible');

-- CreateEnum
CREATE TYPE "Departement" AS ENUM ('DAF', 'DT', 'DG');

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicule" (
    "id" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "matricule" TEXT NOT NULL,
    "etat" "EtatVehicule" NOT NULL DEFAULT 'Disponible',
    "bloquage" "BloquageVehicule" NOT NULL DEFAULT 'Non',

    CONSTRAINT "Vehicule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chauffeur" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "etat" "EtatChauffeur" NOT NULL DEFAULT 'Disponible',

    CONSTRAINT "Chauffeur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Indisponibilite" (
    "id" TEXT NOT NULL,
    "id_vehicule" TEXT NOT NULL,
    "chauffeurId" TEXT NOT NULL,
    "debut_indisponibilite" TIMESTAMP(3) NOT NULL,
    "fin_indisponibilite" TIMESTAMP(3) NOT NULL,
    "departement" "Departement" DEFAULT 'DG',
    "chef_mission" TEXT,
    "itineraire" TEXT NOT NULL,
    "motif" TEXT NOT NULL,

    CONSTRAINT "Indisponibilite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicule_matricule_key" ON "Vehicule"("matricule");

-- AddForeignKey
ALTER TABLE "Indisponibilite" ADD CONSTRAINT "Indisponibilite_id_vehicule_fkey" FOREIGN KEY ("id_vehicule") REFERENCES "Vehicule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Indisponibilite" ADD CONSTRAINT "Indisponibilite_chauffeurId_fkey" FOREIGN KEY ("chauffeurId") REFERENCES "Chauffeur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
