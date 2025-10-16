-- CreateTable
CREATE TABLE "_AdminToDenuncia" (
    "A" VARCHAR(36) NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AdminToDenuncia_AB_unique" ON "_AdminToDenuncia"("A", "B");

-- CreateIndex
CREATE INDEX "_AdminToDenuncia_B_index" ON "_AdminToDenuncia"("B");

-- AddForeignKey
ALTER TABLE "_AdminToDenuncia" ADD CONSTRAINT "_AdminToDenuncia_A_fkey" FOREIGN KEY ("A") REFERENCES "admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdminToDenuncia" ADD CONSTRAINT "_AdminToDenuncia_B_fkey" FOREIGN KEY ("B") REFERENCES "denuncias"("id") ON DELETE CASCADE ON UPDATE CASCADE;
