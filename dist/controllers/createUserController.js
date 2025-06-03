"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStatus = exports.deleteUser = exports.updateUser = exports.getUsers = exports.createUser = void 0;
const db_js_1 = require("../config/db.js");
const ALLOWED_USER_STATUSES = ["pendiente", "aprobado", "rechazado"];
const createUser = async (req, res) => {
    const { name, email, area, rol } = req.body;
    try {
        const queryResult = await (0, db_js_1.executeQuery)(`INSERT INTO users (name, email, area, role) VALUES (?, ?, ?, ?)`, [name, email, area, rol]);
        const insertId = queryResult.results.insertId;
        res.status(201).json({
            success: true,
            userId: insertId,
        });
    }
    catch (error) {
        console.error("Error al registrar usuario:", error);
        res
            .status(500)
            .json({ success: false, error: "Error al registrar usuario" });
    }
};
exports.createUser = createUser;
const getUsers = async (req, res) => {
    try {
        const query = `SELECT id, name, status, email, area, role FROM users`;
        const queryResult = await (0, db_js_1.executeQuery)(query);
        if (!Array.isArray(queryResult.results)) {
            console.error("Error al obtener usuarios: la consulta no devolvió el formato esperado (lista de filas).", queryResult.results);
            res.status(500).json({
                success: false,
                error: "Error interno al recuperar datos de usuarios.",
            });
        }
        const usersData = queryResult.results;
        const transformedUsers = usersData.map((user) => ({
            id: user.id,
            name: user.name,
            request: "creacion de usuario",
            status: user.status,
            email: user.email,
            area: user.area,
            role: user.role,
        }));
        res.status(200).json(transformedUsers);
    }
    catch (error) {
        console.error("Error al obtener usuarios:", error);
        res
            .status(500)
            .json({ success: false, error: "Error al obtener usuarios" });
    }
};
exports.getUsers = getUsers;
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, area, role, status } = req.body;
    if (!name && !email && !area && !role && !status) {
        res.status(400).json({
            success: false,
            error: "No se proporcionaron datos para actualizar.",
        });
    }
    try {
        let query = "UPDATE users SET ";
        const values = [];
        const fieldsToUpdate = [];
        if (name !== undefined) {
            fieldsToUpdate.push("name = ?");
            values.push(name);
        }
        if (email !== undefined) {
            fieldsToUpdate.push("email = ?");
            values.push(email);
        }
        if (area !== undefined) {
            fieldsToUpdate.push("area = ?");
            values.push(area);
        }
        if (role !== undefined) {
            fieldsToUpdate.push("role = ?");
            values.push(role);
        }
        if (status !== undefined) {
            fieldsToUpdate.push("status = ?");
            values.push(status);
        }
        query += fieldsToUpdate.join(", ") + " WHERE id = ?";
        values.push(id);
        const queryResult = await (0, db_js_1.executeQuery)(query, values);
        const affectedRows = queryResult.results.affectedRows;
        if (affectedRows === 0) {
            res.status(404).json({
                success: false,
                error: "Usuario no encontrado o sin cambios.",
            });
        }
        res
            .status(200)
            .json({ success: true, message: "Usuario actualizado correctamente." });
    }
    catch (error) {
        console.error("Error al actualizar usuario:", error);
        res
            .status(500)
            .json({ success: false, error: "Error al actualizar usuario." });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const queryResult = await (0, db_js_1.executeQuery)(`DELETE FROM users WHERE id = ?`, [
            id,
        ]);
        const affectedRows = queryResult.results.affectedRows;
        if (affectedRows === 0) {
            res.status(404).json({ success: false, error: "Usuario no encontrado." });
        }
        res
            .status(200)
            .json({ success: true, message: "Usuario eliminado correctamente." });
    }
    catch (error) {
        console.error("Error al eliminar usuario:", error);
        res
            .status(500)
            .json({ success: false, error: "Error al eliminar usuario." });
    }
};
exports.deleteUser = deleteUser;
const updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!id) {
        res.status(400).json({
            success: false,
            error: "El ID del usuario es requerido en los parámetros de la URL.",
        });
    }
    if (status === undefined) {
        res.status(400).json({
            success: false,
            error: "El nuevo estado (status) es requerido en el cuerpo de la solicitud.",
        });
    }
    if (typeof status !== "string" || !ALLOWED_USER_STATUSES.includes(status)) {
        res.status(400).json({
            success: false,
            error: `El estado proporcionado no es válido. Los valores permitidos son: ${ALLOWED_USER_STATUSES.join(", ")}.`,
        });
    }
    try {
        const query = "UPDATE users SET status = ? WHERE id = ?";
        const values = [status, id];
        const queryResult = await (0, db_js_1.executeQuery)(query, values);
        const affectedRows = queryResult.results.affectedRows;
        if (affectedRows === 0) {
            res.status(404).json({
                success: false,
                error: "Usuario no encontrado o el estado ya era el actual (no se realizaron cambios).",
            });
        }
        res.status(200).json({
            success: true,
            message: "El estado del usuario ha sido actualizado correctamente.",
        });
    }
    catch (error) {
        console.error("Error al actualizar el estado del usuario:", error);
        res.status(500).json({
            success: false,
            error: "Ocurrió un error interno al intentar actualizar el estado del usuario.",
        });
    }
};
exports.updateStatus = updateStatus;
