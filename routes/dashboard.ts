import { PrismaClient } from "@prisma/client"
import { Router } from "express"

const prisma = new PrismaClient()
const router = Router()

router.get("/gerais", async (req, res) => {
  try {
    const livros = await prisma.livros.count()
    const reviews = await prisma.review.count()
    const denuncias = await prisma.denuncia.count()
    res.status(200).json({ livros, reviews, denuncias })
  } catch (error) {
    res.status(400).json(error)
  }
})


router.get("/AutoresPorLivro", async (req, res) => {
  try {
    const autores = await prisma.autores.findMany({
      select: {
        nome: true,
        livros: {
          select: { id: true } // só para contar
        }
      }
    });

    const resultado = autores
      .map(a => ({ autor: a.nome, num: a.livros.length }))
      .filter(a => a.num > 0);

    res.status(200).json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar autores por livro", details: error });
  }
});

router.get("/LivrosReviews", async (req, res) => {
  try {
    const livros = await prisma.livros.findMany({
      select: {
        nome: true,
        _count: { select: { reviews: true } }
      }
    });

    // Ordena localmente por número de reviews
    const resultado = livros
      .map(l => ({ livro: l.nome, num: l._count.reviews }))
      .filter(l => l.num > 0)
      .sort((a, b) => b.num - a.num) // do maior pro menor
      .slice(0, 5); // pega top 5

    res.status(200).json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar livros com mais reviews", details: error });
  }
});


export default router