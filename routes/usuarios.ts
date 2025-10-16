import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import bcrypt from "bcrypt"
import { z } from "zod"

const prisma = new PrismaClient()
const router = Router()

// Ajustei para nomes minúsculos e campos email e cidade adicionados
export const usuarioSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(45),
  email: z.string().min(1, "Email é obrigatório").max(45),
  senha: z.string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(60, "Senha muito longa"),
})

// Função para validar senha customizada
function validaSenha(senha: string) {
  const mensagens: string[] = []

  if (senha.length < 8) {
    mensagens.push("Senha deve possuir no mínimo 8 caracteres")
  }

  let pequenas = 0
  let grandes = 0
  let numeros = 0
  let simbolos = 0

  for (const letra of senha) {
    if (/[a-z]/.test(letra)) pequenas++
    else if (/[A-Z]/.test(letra)) grandes++
    else if (/[0-9]/.test(letra)) numeros++
    else simbolos++
  }

  if (pequenas === 0) mensagens.push("Senha deve possuir letra(s) minúscula(s)")
  if (grandes === 0) mensagens.push("Senha deve possuir letra(s) maiúscula(s)")
  if (numeros === 0) mensagens.push("Senha deve possuir número(s)")
  if (simbolos === 0) mensagens.push("Senha deve possuir símbolo(s)")

  return mensagens
}

// GET todos os usuários
router.get("/", async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany()
    res.status(200).json(usuarios)
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar usuários", details: error })
  }
})

// POST criar usuário
router.post("/", async (req, res) => {
  const valida = usuarioSchema.safeParse(req.body)
  if (!valida.success) {
    return res.status(400).json({ error: valida.error.flatten() })
  }

  const errosSenha = validaSenha(valida.data.senha)
  if (errosSenha.length > 0) {
    return res.status(400).json({ error: errosSenha.join("; ") })
  }

  const salt = bcrypt.genSaltSync(12)
  const hash = bcrypt.hashSync(valida.data.senha, salt)

  const { nome, email } = valida.data

  try {
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: hash,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    res.status(201).json(usuario)
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar usuário", details: error })
  }
})

// GET usuário por ID
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id)
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" })

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!usuario) return res.status(404).json({ error: "Usuário não encontrado" })

    res.status(200).json(usuario)
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar usuário", details: error })
  }
})

export default router
