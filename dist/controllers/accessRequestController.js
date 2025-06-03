"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccessRequest = exports.updateAccessRequest = exports.getAccessRequestById = exports.getAccessRequests = exports.createAccessRequest = void 0;
const db_js_1 = require("../config/db.js");
const ALLOWED_REQUEST_STATUSES = ["pendiente", "aprobado", "rechazado"];
const createAccessRequest = async (req, res) => {
    console.log('Entramos el metodo del back');
    const { user_id, access_type } = req.body;
    console.log("Los datos que llegana la back son: ", req.body);
    if (!user_id || !access_type) {
        res.status(400).json({
            success: false,
            error: "user_id y access_type son requeridos.",
        });
    }
    try {
        const userCheck = await (0, db_js_1.executeQuery)("SELECT id FROM users WHERE id = ?", [
            user_id,
        ]);
        if (userCheck.results.length === 0) {
            res.status(404).json({ success: false, error: "Usuario no encontrado." });
        }
        const queryResult = await (0, db_js_1.executeQuery)("INSERT INTO access_requests (user_id, access_type) VALUES (?, ?)", [user_id, access_type]);
        const insertId = queryResult.results.insertId;
        res.status(201).json({
            success: true,
            accessRequestId: insertId,
            // request: "solicitud de acceso", // Este campo no parece estándar en otras respuestas
            message: "Solicitud de acceso creada correctamente.",
        });
    }
    catch (error) {
        console.error("Error al crear solicitud de acceso:", error);
        res.status(500).json({
            success: false,
            error: "Error interno al crear la solicitud de acceso.",
        });
    }
};
exports.createAccessRequest = createAccessRequest;
const getAccessRequests = async (req, res) => {
    try {
        const query = `
      SELECT ar.id, ar.user_id, u.name as user_name, u.email as user_email, ar.access_type, ar.status, ar.created_at
      FROM access_requests ar
      JOIN users u ON ar.user_id = u.id
    `;
        const queryResult = await (0, db_js_1.executeQuery)(query);
        if (!Array.isArray(queryResult.results)) {
            console.error("Error al obtener solicitudes: formato inesperado.");
            res.status(500).json({
                success: false,
                error: "Error interno al recuperar datos de solicitudes.",
            });
        }
        res.status(200).json({ success: true, data: queryResult.results });
    }
    catch (error) {
        console.error("Error al obtener solicitudes de acceso:", error);
        res.status(500).json({
            success: false,
            error: "Error interno al obtener las solicitudes de acceso.",
        });
    }
};
exports.getAccessRequests = getAccessRequests;
const getAccessRequestById = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
      SELECT ar.id, ar.user_id, u.name as user_name, u.email as user_email, ar.access_type, ar.status, ar.created_at 
      FROM access_requests ar
      JOIN users u ON ar.user_id = u.id
      WHERE ar.id = ?
    `;
        const queryResult = await (0, db_js_1.executeQuery)(query, [id]);
        const request = queryResult.results[0];
        if (!request) {
            res
                .status(404)
                .json({ success: false, error: "Solicitud de acceso no encontrada." });
        }
        res.status(200).json({ success: true, data: request });
    }
    catch (error) {
        console.error("Error al obtener solicitud de acceso por ID:", error);
        res.status(500).json({
            success: false,
            error: "Error interno al obtener la solicitud de acceso.",
        });
    }
};
exports.getAccessRequestById = getAccessRequestById;
const updateAccessRequest = async (req, res) => {
    const { id } = req.params;
    const { user_id, access_type, status } = req.body;
    if (user_id === undefined && access_type === undefined && status === undefined) {
        res.status(400).json({
            success: false,
            error: "No se proporcionaron datos para actualizar. Se requiere al menos user_id, access_type o status.",
        });
    }
    const fieldsToUpdate = [];
    const values = [];
    try {
        if (user_id !== undefined) {
            // Validar que el nuevo user_id existe
            const userCheck = await (0, db_js_1.executeQuery)("SELECT id FROM users WHERE id = ?", [user_id]);
            if (userCheck.results.length === 0) {
                res.status(404).json({ success: false, error: "El user_id proporcionado no corresponde a un usuario existente." });
            }
            fieldsToUpdate.push("user_id = ?");
            values.push(user_id);
        }
        if (access_type !== undefined) {
            if (typeof access_type !== 'string' || access_type.trim() === '') {
                res.status(400).json({ success: false, error: "access_type debe ser una cadena no vacía." });
            }
            fieldsToUpdate.push("access_type = ?");
            values.push(access_type);
        }
        if (status !== undefined) {
            if (typeof status !== "string" || !ALLOWED_REQUEST_STATUSES.includes(status)) {
                res.status(400).json({
                    success: false,
                    error: `El estado proporcionado no es válido. Permitidos: ${ALLOWED_REQUEST_STATUSES.join(", ")}.`,
                });
            }
            fieldsToUpdate.push("status = ?");
            values.push(status);
        }
        if (fieldsToUpdate.length === 0) {
            // Este caso no debería ocurrir si la validación inicial es correcta, pero es una salvaguarda.
            res.status(400).json({ success: false, error: "No hay campos válidos para actualizar." });
        }
        const query = `UPDATE access_requests SET ${fieldsToUpdate.join(", ")} WHERE id = ?`;
        values.push(id);
        const queryResult = await (0, db_js_1.executeQuery)(query, values);
        const affectedRows = queryResult.results.affectedRows;
        if (affectedRows === 0) {
            res.status(404).json({
                success: false,
                error: "Solicitud de acceso no encontrada o sin cambios (los datos podrían ser los mismos).",
            });
        }
        res
            .status(200)
            .json({ success: true, message: "Solicitud de acceso actualizada correctamente." });
    }
    catch (error) {
        console.error("Error al actualizar la solicitud de acceso:", error);
        res
            .status(500)
            .json({ success: false, error: "Error interno al actualizar la solicitud de acceso." });
    }
};
exports.updateAccessRequest = updateAccessRequest;
const deleteAccessRequest = async (req, res) => {
    const { id } = req.params;
    try {
        const queryResult = await (0, db_js_1.executeQuery)("DELETE FROM access_requests WHERE id = ?", [id]);
        const affectedRows = queryResult.results.affectedRows;
        if (affectedRows === 0) {
            res
                .status(404)
                .json({ success: false, error: "Solicitud de acceso no encontrada." });
        }
        res
            .status(200)
            .json({ success: true, message: "Solicitud de acceso eliminada." });
    }
    catch (error) {
        console.error("Error al eliminar solicitud de acceso:", error);
        res.status(500).json({
            success: false,
            error: "Error interno al eliminar la solicitud.",
        });
    }
};
exports.deleteAccessRequest = deleteAccessRequest;
