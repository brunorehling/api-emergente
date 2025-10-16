import { PrismaClient } from '@prisma/client'
import { Router } from 'express'
import { z } from 'zod'

const prisma = new PrismaClient()
const router = Router()

const reviewSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  conteudo: z.string().max(500).optional(),
  nota: z.number().int().min(1, "a nota deve ser no mínimo 1").max(5, "A nota deve ser no maximo 5"),
  usuarioId: z.number().int().optional(),
  livros_id: z.number().int().optional(),
})

// GET todas as reviews
router.get("/", async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        usuario: true,
        livro: true,
      },
    })
    res.status(200).json(reviews)
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar reviews", details: error })
  }
})


router.get("/minhasReviews", async (req, res) => {
  const usuarioId = Number(req.query.usuarioId)

  if (!usuarioId) {
    return res.status(400).json({ error: "usuarioId é obrigatório" })
  }

  try {
    const reviews = await prisma.review.findMany({
      where: { usuarioId },
      include: {
        usuario: true,
        livro: true
      },
      orderBy: { createdAt: "desc" }
    })

    res.json(reviews)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Erro ao buscar suas reviews" })
  }
})


// GET review por ID
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id)
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" })

  try {
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        usuario: true,
        livro: true,
      },
    })

    if (!review) return res.status(404).json({ error: "Review não encontrada" })
    res.status(200).json(review)
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar review", details: error })
  }
})

// GET pesquisa de reviews
router.get("/pesquisa/:termo", async (req, res) => {
  const { termo } = req.params;

  if (!termo || termo.length < 2) {
    return res.status(400).json({ error: "Informe ao menos 2 caracteres" });
  }

  try {
    const reviews = await prisma.review.findMany({
      where: {
        OR: [
          { titulo: { contains: termo, mode: "insensitive" } },
          { conteudo: { contains: termo, mode: "insensitive" } },
          {
            livro: {
              nome: { contains: termo, mode: "insensitive" } // 👈 se teu modelo Livro tiver campo nome
            }
          }
        ],
      },
      include: {
        usuario: true,
        livro: true,
      },
      orderBy: { id: "desc" },
    });

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Erro ao buscar reviews:", error);
    res.status(500).json({ error: "Erro ao buscar reviews", details: error });
  }
});


// POST criar uma review
router.post("/", async (req, res) => {
  const valida = reviewSchema.safeParse(req.body)
  if (!valida.success) {
    return res.status(400).json({ error: valida.error.flatten() })
  }

  const { titulo, conteudo, nota, usuarioId, livros_id } = valida.data

  try {
    const nova = await prisma.review.create({
      data: { titulo, conteudo, nota, usuarioId, livros_id },
    })
    res.status(201).json(nova)
  } catch (error) {
    console.log("Erro do Prisma:", error);
    res.status(500).json({ error: "Erro ao criar review", details: error })
  }
})

// PUT atualizar review
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id)
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" })

  const valida = reviewSchema.safeParse(req.body)
  if (!valida.success) {
    return res.status(400).json({ error: valida.error.flatten() })
  }

  const { titulo, conteudo, nota, usuarioId, livros_id } = valida.data

  try {
    const atualizada = await prisma.review.update({
      where: { id },
      data: { titulo, conteudo, nota, usuarioId, livros_id },
    })
    res.status(200).json(atualizada)
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar review", details: error })
  }
})

// DELETE review
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id)
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" })

  try {
    const deletada = await prisma.review.delete({
      where: { id },
    })
    res.status(200).json(deletada)
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar review", details: error })
  }
})

// GET comentários de uma review
router.get("/:id/comentarios", async (req, res) => {
  const reviewId = Number(req.params.id)
  if (isNaN(reviewId)) return res.status(400).json({ error: "ID inválido" })

  try {
    const comentarios = await prisma.comentarios.findMany({
      where: { reviewId },
      include: { 
        usuario: {
          select: {
            id: true,
            nome: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
    })
    res.status(200).json(comentarios)
  } catch (error) {
    console.error('Erro ao buscar comentários:', error)
    res.status(500).json({ error: "Erro ao buscar comentários", details: error })
  }
})

// POST criar comentário em uma review
router.post("/:id/comentarios", async (req, res) => {
  const reviewId = Number(req.params.id)
  if (isNaN(reviewId)) return res.status(400).json({ error: "ID inválido" })

  const valida = z.object({
    conteudo: z.string().min(1, "Comentário é obrigatório"),
    usuarioId: z.number().int(),
  }).safeParse(req.body)

  if (!valida.success) {
    return res.status(400).json({ error: valida.error.flatten() })
  }

  const { conteudo, usuarioId } = valida.data

  try {
    // Verificar se a review existe
    const reviewExiste = await prisma.review.findUnique({
      where: { id: reviewId }
    })
    
    if (!reviewExiste) {
      return res.status(404).json({ error: "Review não encontrada" })
    }

    // Verificar se o usuário existe
    const usuarioExiste = await prisma.usuario.findUnique({
      where: { id: usuarioId }
    })
    
    if (!usuarioExiste) {
      return res.status(404).json({ error: "Usuário não encontrado" })
    }

    const comentario = await prisma.comentarios.create({
      data: { conteudo, usuarioId, reviewId },
      include: { 
        usuario: {
          select: {
            id: true,
            nome: true
          }
        }
      },
    })
    res.status(201).json(comentario)
  } catch (error) {
    console.error('Erro ao criar comentário:', error)
    res.status(500).json({ error: "Erro ao criar comentário", details: error })
  }
})

router.delete("/:reviewId/comentarios/:comentarioId", async (req, res) => {
  const reviewId = Number(req.params.reviewId);
  const comentarioId = Number(req.params.comentarioId);

  if (isNaN(reviewId) || isNaN(comentarioId)) {
    return res.status(400).json({ error: "IDs inválidos" });
  }

  try {
    const comentario = await prisma.comentarios.findUnique({
      where: { id: comentarioId },
    });

    if (!comentario || comentario.reviewId !== reviewId) {
      return res.status(404).json({ error: "Comentário não encontrado para esta review" });
    }

    await prisma.comentarios.delete({
      where: { id: comentarioId },
    });

    res.status(200).json({ message: "Comentário deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar comentário:", error);
    res.status(500).json({
      error: "Erro ao deletar comentário",
      details: error instanceof Error ? error.message : error,
    });
  }
});



export default router