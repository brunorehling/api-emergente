import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import { z } from "zod";

const prisma = new PrismaClient()
const router = Router();

const denunciaSchema = z.object({
  comentarioId: z.number(),
  usuarioId: z.number(),
  motivo: z.string().min(5),
});


router.get("/", async (req, res) => {
  try {
    const denuncias = await prisma.denuncia.findMany({
    include: {
        comentario: {
        include: {
            usuario: true,
            review: true, 
        },
        },
        usuario: true, 
        admin: true,
    },
    orderBy: { createdAt: "desc" },
    });

    res.json(denuncias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensagem: "Erro ao buscar denúncias" });
  }
});

router.post("/", async (req, res) => {
  try {
    const dados = denunciaSchema.parse(req.body);

    const denuncia = await prisma.denuncia.create({
      data: {
        comentarioId: dados.comentarioId,
        usuarioId: dados.usuarioId,
        motivo: dados.motivo,
      },
    });

    res.status(201).json({ mensagem: "Denúncia registrada com sucesso", denuncia });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ erros: error.errors });
    }
    console.error(error);
    res.status(500).json({ mensagem: "Erro interno do servidor" });
  }
});

export default router;
