/*
  Warnings:

  - Changed the type of `color` on the `Tag` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TagColor" AS ENUM ('RED', 'ORANGE', 'AMBER', 'YELLOW', 'LIME', 'GREEN', 'EMERALD', 'TEAL', 'CYAN', 'SKY', 'BLUE', 'INDIGO', 'VIOLET', 'PURPLE', 'FUCHSIA', 'PINK', 'ROSE', 'GRAY', 'ZINC', 'NEUTRAL', 'STONE');

-- AlterTable
ALTER TABLE "Tag" ALTER COLUMN "name" SET DEFAULT 'Etiqueta nueva',
DROP COLUMN "color",
ADD COLUMN     "color" "TagColor" NOT NULL;
