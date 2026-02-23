const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { email, password, name, role, branchId } = req.body;
        // companyId comes from the authenticated token (secure), fallback to body
        const companyId = req.user?.companyId || req.body.companyId;

        if (!email || !password || !name || !companyId) {
            return res.status(400).json({ message: 'Campos requeridos: email, password, nombre, companyId' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'El correo ya está en uso por otro usuario' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: role || 'DENTIST',
                companyId: parseInt(companyId),
                branchId: branchId ? parseInt(branchId) : null,
            },
        });

        res.status(201).json({ message: 'Usuario creado exitosamente', userId: user.id });
    } catch (error) {
        console.error('Error en register:', error);
        res.status(500).json({ message: 'Error en el servidor', detail: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        if (!user.active) {
            return res.status(403).json({ message: 'Usuario desactivado' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role,
                email: user.email,
                companyId: user.companyId,
                branchId: user.branchId
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                companyId: user.companyId,
                branchId: user.branchId,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

const getUsers = async (req, res) => {
    try {
        const { companyId } = req.user;
        const { role } = req.query;

        const users = await prisma.user.findMany({
            where: {
                companyId,
                role: role ? role : undefined,
                active: true
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                branchId: true
            }
        });

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener usuarios' });
    }
};

const updateUser = async (req, res) => {
    try {
        const { companyId } = req.user;
        const { id } = req.params;
        const { name, email, role, branchId, active } = req.body;

        const user = await prisma.user.update({
            where: {
                id: parseInt(id),
                companyId // Security check
            },
            data: {
                name,
                email,
                role: role ? role : undefined,
                branchId: branchId ? parseInt(branchId) : (branchId === null ? null : undefined),
                active,
                updatedAt: new Date()
            }
        });

        res.json(user);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error al actualizar el usuario' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { companyId } = req.user;
        const { id } = req.params;

        await prisma.user.update({
            where: {
                id: parseInt(id),
                companyId
            },
            data: { active: false }
        });

        res.json({ message: 'Usuario desactivado exitosamente' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error al eliminar el usuario' });
    }
};

module.exports = {
    register,
    login,
    getUsers,
    updateUser,
    deleteUser
};
