import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { verificarToken, verificarRol, firmaToken, type JwtPayload } from '../middleware/auth.middleware.js';
import { credencialesSchema, registroSchema, perfilSchema } from '../lib/validators.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const parsed = credencialesSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Datos inválidos' });
      return;
    }

    const { email, password } = parsed.data;
    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    const passwordValido = await bcrypt.compare(password, usuario.passwordHash);
    if (!passwordValido) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    const payload: JwtPayload = { sub: usuario.id, email: usuario.email, rol: usuario.rol };
    const token = firmaToken(payload);

    res.json({
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/auth/register  (solo ADMIN)
router.post('/register', verificarToken, verificarRol('ADMIN'), async (req, res) => {
  try {
    const parsed = registroSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Datos inválidos' });
      return;
    }

    const { nombre, email, password } = parsed.data;
    const existe = await prisma.usuario.findUnique({ where: { email } });
    if (existe) {
      res.status(409).json({ error: 'Ya existe una cuenta con ese email' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const usuario = await prisma.usuario.create({
      data: { nombre, email, passwordHash, rol: 'VENDEDOR' },
    });

    const payload: JwtPayload = { sub: usuario.id, email: usuario.email, rol: usuario.rol };
    const token = firmaToken(payload);

    res.status(201).json({
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PUT /api/auth/perfil
router.put('/perfil', verificarToken, async (req, res) => {
  try {
    const parsed = perfilSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Datos inválidos' });
      return;
    }

    const { nombre, email, password } = parsed.data;
    const userId = req.usuario!.sub;

    const existe = await prisma.usuario.findUnique({ where: { email } });
    if (existe && existe.id !== userId) {
      res.status(409).json({ error: 'El email ya está en uso por otra cuenta' });
      return;
    }

    const data: { nombre: string; email: string; passwordHash?: string } = { nombre, email };
    if (password) {
      data.passwordHash = await bcrypt.hash(password, 12);
    }

    const usuario = await prisma.usuario.update({ where: { id: userId }, data });

    res.json({
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
