"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateComputer = exports.getComputerById = exports.getComputers = exports.createComputer = void 0;
const db_js_1 = require("../config/db.js");
const createComputer = async (req, res) => {
    const { serial_number, model } = req.body;
    if (!serial_number || !model) {
        res.status(400).json({
            success: false,
            error: "serial_number y model son requeridos.",
        });
    }
    try {
        const queryResult = await (0, db_js_1.executeQuery)("INSERT INTO computers (serial_number, model) VALUES (?, ?)", [serial_number, model]);
        const insertId = queryResult.results.insertId;
        res.status(201).json({
            success: true,
            computerId: insertId,
            message: "Equipo de cómputo creado correctamente.",
        });
    }
    catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            res
                .status(409)
                .json({ success: false, error: "El número de serie ya existe." });
        }
        console.error("Error al crear equipo de cómputo:", error);
        res.status(500).json({
            success: false,
            error: "Error interno al crear el equipo de cómputo.",
        });
    }
};
exports.createComputer = createComputer;
const getComputers = async (req, res) => {
    try {
        const query = "SELECT id, serial_number, model, is_assigned FROM computers";
        const queryResult = await (0, db_js_1.executeQuery)(query);
        if (!Array.isArray(queryResult.results)) {
            res.status(500).json({
                success: false,
                error: "Error interno al recuperar datos de equipos.",
            });
        }
        res.status(200).json({ success: true, data: queryResult.results });
    }
    catch (error) {
        console.error("Error al obtener equipos de cómputo:", error);
        res.status(500).json({
            success: false,
            error: "Error interno al obtener los equipos de cómputo.",
        });
    }
};
exports.getComputers = getComputers;
const getComputerById = async (req, res) => {
    const { id } = req.params;
    try {
        const queryResult = await (0, db_js_1.executeQuery)("SELECT id, serial_number, model, is_assigned FROM computers WHERE id = ?", [id]);
        const computer = queryResult.results[0];
        if (!computer) {
            res
                .status(404)
                .json({ success: false, error: "Equipo de cómputo no encontrado." });
        }
        res.status(200).json({ success: true, data: computer });
    }
    catch (error) {
        console.error("Error al obtener equipo por ID:", error);
        res.status(500).json({ success: false, error: "Error interno." });
    }
};
exports.getComputerById = getComputerById;
const updateComputer = async (req, res) => {
    const { id } = req.params;
    const { serial_number, model } = req.body;
    if (!serial_number && !model) {
        res.status(400).json({
            success: false,
            error: "No se proporcionaron datos para actualizar.",
        });
    }
    // Construcción dinámica de la consulta similar a updateUser
    const fieldsToUpdate = [];
    const values = [];
    if (serial_number !== undefined) {
        fieldsToUpdate.push("serial_number = ?");
        values.push(serial_number);
    }
    if (model !== undefined) {
        fieldsToUpdate.push("model = ?");
        values.push(model);
    }
    if (fieldsToUpdate.length === 0) {
        // Doble chequeo por si acaso
        res.status(400).json({
            success: false,
            error: "No hay campos válidos para actualizar.",
        });
    }
    values.push(id);
    const query = `UPDATE computers SET ${fieldsToUpdate.join(", ")} WHERE id = ?`;
    try {
        const queryResult = await (0, db_js_1.executeQuery)(query, values);
        const affectedRows = queryResult.results.affectedRows;
        if (affectedRows === 0) {
            res
                .status(404)
                .json({ success: false, error: "Equipo no encontrado o sin cambios." });
        }
        res.status(200).json({ success: true, message: "Equipo actualizado." });
    }
    catch (error) {
        console.error("Error al actualizar equipo:", error);
        res.status(500).json({ success: false, error: "Error al actualizar." });
    }
};
exports.updateComputer = updateComputer;
// deleteComputer se omite intencionalmente si las computadoras no deben eliminarse una vez asignadas o si hay FK constraints.
// Si se necesita, se puede añadir con cuidado de las asignaciones.
