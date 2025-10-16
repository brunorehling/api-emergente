import jwt from "jsonwebtoken"
import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()
const router = Router()

router.post("/", async (req, res) => {
  let { email, senha } = req.body

  const mensaPadrao = "Login ou senha incorretos"

  if (!email || !senha) {
    res.status(400).json({ erro: mensaPadrao })
    return
  }

  // normaliza email: remove espaços e coloca tudo em minúsculo
  email = email.trim().toLowerCase()

  try {
    const admin = await prisma.admin.findFirst({
      where: { email: email.trim().toLowerCase() }
    })

    if (!admin) {
      res.status(400).json({ erro: mensaPadrao })
      return
    }

    // compara senha com bcrypt
    const senhaValida = bcrypt.compareSync(senha, admin.senha)
    if (!senhaValida) {
      // opcional: registra log de tentativa de acesso
      await prisma.log.create({
        data: {
          descricao: "Tentativa de acesso ao sistema",
          complemento: `Admin: ${admin.id} - ${admin.nome}`,
          adminId: admin.id
        }
      })
      res.status(400).json({ erro: mensaPadrao })
      return
    }

    // gera token JWT
    const token = jwt.sign(
      {
        adminLogadoId: admin.id,
        adminLogadoNome: admin.nome,
        adminLogadoNivel: admin.nivel
      },
      process.env.JWT_KEY as string,
      { expiresIn: "1h" }
    )

    res.status(200).json({
      id: admin.id,
      nome: admin.nome,
      email: admin.email,
      nivel: admin.nivel,
      token
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ erro: "Erro interno no servidor" })
  }
})

export default router
