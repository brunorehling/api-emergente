import { PrismaClient } from '@prisma/client'
import { Router } from 'express'
import { z } from 'zod'

const prisma = new PrismaClient()
const router = Router()

const autorSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(45),
})

router.get("/", async (req, res) => {
  try {
    const autores = await prisma.autores.findMany()
    res.status(200).json(autores)
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar autores", details: error })
  }
})

router.post("/", async (req, res) => {
  const valida = autorSchema.safeParse(req.body)
  if (!valida.success) {
    return res.status(400).json({ error: valida.error.flatten() })
  }

  const { nome } = valida.data

  try {
    const autor = await prisma.autores.create({
      data: { nome }
    })
    res.status(201).json(autor)
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar autor", details: error })
  }
})

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id)
  if (isNaN(id)) {
    return res.status(400).json({ error: "ID inválido" })
  }

  try {
    const autor = await prisma.autores.delete({
      where: { id }
    })
    res.status(200).json(autor)
  } catch (error) {
    res.status(404).json({ error: "Autor não encontrado", details: error })
  }
})

router.put("/:id", async (req, res) => {
  const id = Number(req.params.id)
  if (isNaN(id)) {
    return res.status(400).json({ error: "ID inválido" })
  }

  const valida = autorSchema.safeParse(req.body)
  if (!valida.success) {
    return res.status(400).json({ error: valida.error.flatten() })
  }

  const { nome } = valida.data

  try {
    const autor = await prisma.autores.update({
      where: { id },
      data: { nome }
    })
    res.status(200).json(autor)
  } catch (error) {
    res.status(404).json({ error: "Autor não encontrado", details: error })
  }
})

export default router

