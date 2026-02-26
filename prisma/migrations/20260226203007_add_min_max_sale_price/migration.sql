-- AlterTable
ALTER TABLE "movements" ADD COLUMN     "unitPrice" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "maxSalePrice" DECIMAL(10,2),
ADD COLUMN     "minSalePrice" DECIMAL(10,2);
