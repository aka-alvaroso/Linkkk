/*
  Warnings:

  - You are about to drop the column `accessType` on the `Access` table. All the data in the column will be lost.
  - You are about to drop the column `d_access` on the `Access` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `Tag` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(25)`.
  - Added the required column `method` to the `Access` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `device` on the `Access` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Method" AS ENUM ('LINK', 'QRCODE');

-- CreateEnum
CREATE TYPE "Device" AS ENUM ('MOBILE', 'DESKTOP');

-- AlterTable
ALTER TABLE "Access" DROP COLUMN "accessType",
DROP COLUMN "d_access",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "method" "Method" NOT NULL,
DROP COLUMN "device",
ADD COLUMN     "device" "Device" NOT NULL;

-- AlterTable
ALTER TABLE "Tag" ALTER COLUMN "name" SET DATA TYPE VARCHAR(25),
ALTER COLUMN "color" SET DEFAULT 'NEUTRAL';
