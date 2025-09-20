/*
  Warnings:

  - You are about to drop the column `name` on the `Group` table. All the data in the column will be lost.
  - The `color` column on the `Tag` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `description` to the `Group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Group` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Colors" AS ENUM ('RED', 'ORANGE', 'AMBER', 'YELLOW', 'LIME', 'GREEN', 'EMERALD', 'TEAL', 'CYAN', 'SKY', 'BLUE', 'INDIGO', 'VIOLET', 'PURPLE', 'FUCHSIA', 'PINK', 'ROSE', 'GRAY', 'ZINC', 'NEUTRAL', 'STONE');

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "name",
ADD COLUMN     "color" "Colors" NOT NULL DEFAULT 'NEUTRAL',
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "color",
ADD COLUMN     "color" "Colors" NOT NULL DEFAULT 'NEUTRAL';

-- DropEnum
DROP TYPE "TagColor";
