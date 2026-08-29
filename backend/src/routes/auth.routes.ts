import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import type { JwtPayload } from '../middleware/auth.middleware.js';

const JWT_SECRET = process.env.JWT_SECRET ?? 'draco-dev-secret';
const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    console.log('[LOGIN] body:', JSON.stringify(req.body));
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      res.status(400).json({ error: 'Email y contraseña son requeridos' });
      return;
    }

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
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    res.json({
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { nombre, email, password } = req.body as { nombre?: string; email?: string; password?: string };

    if (!nombre || !email || !password) {
      res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    const existe = await prisma.usuario.findUnique({ where: { email } });
    if (existe) {
      res.status(409).json({ error: 'Ya existe una cuenta con ese email' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const usuario = await prisma.usuario.create({
      data: { nombre, email, passwordHash, rol: 'VENDEDOR' },
    });

    const payload: JwtPayload = { sub: usuario.id, email: usuario.email, rol: usuario.rol };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    res.status(201).json({
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol },
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

import { authMiddleware } from '../middleware/auth.middleware.js';

// PUT /api/auth/perfil
router.put('/perfil', authMiddleware, async (req: any, res) => {
  try {
    const userId = req.user.sub;
    const { nombre, email, password } = req.body as { nombre?: string; email?: string; password?: string };

    if (!nombre || !email) {
      res.status(400).json({ error: 'Nombre y email son requeridos' });
      return;
    }

    // Verificar si el nuevo email ya está en uso por otro usuario
    const existe = await prisma.usuario.findUnique({ where: { email } });
    if (existe && existe.id !== userId) {
      res.status(409).json({ error: 'El email ya está en uso por otra cuenta' });
      return;
    }

    const dataToUpdate: any = { nombre, email };

    if (password && password.length >= 6) {
      dataToUpdate.passwordHash = await bcrypt.hash(password, 10);
    }

    const usuario = await prisma.usuario.update({
      where: { id: userId },
      data: dataToUpdate
    });

    res.json({
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;