import { Request, Response } from "express";
import pool, { executeQuery, QueryResult } from "../config/db.js";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

const ALLOWED_ASSIGNMENT_STATUSES = ["pendiente", "aprobado", "rechazado"];

/**
 * @description Crea una nueva asignación de computadora a un usuario.
 * @param req Request con user_id, serial_number y opcionalmente assigned_at en el body.
 * @param res Response
 */
export const createAssignment = async (req: Request, res: Response) => {
  const { user_id, serial_number, assigned_at } = req.body;
  console.log("Los datos que llegana la back son: ", req.body);

  if (!user_id || !serial_number) {
    res.status(400).json({
      success: false,
      error: "Los campos user_id y serial_number son requeridos.",
    });
  }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [userCheckResult] = await connection.execute<RowDataPacket[]>(
      "SELECT id FROM users WHERE id = ?",
      [user_id]
    );
    if (userCheckResult.length === 0) {
      await connection.rollback();
      res.status(404).json({ success: false, error: "Usuario no encontrado." });
    }

    const [computerCheckResultRows] = await connection.execute<RowDataPacket[]>(
      "SELECT id, is_assigned FROM computers WHERE serial_number = ?",
      [serial_number]
    );
    const computer = computerCheckResultRows[0];

    if (!computer) {
      await connection.rollback();
      res.status(404).json({
        success: false,
        error:
          "Equipo de cómputo con el número de serie proporcionado no encontrado.",
      });
    }
    if (computer.is_assigned) {
      await connection.rollback();
      res.status(409).json({
        success: false,
        error: "El equipo de cómputo ya está asignado a otro usuario.",
      });
    }
    const found_computer_id = computer.id;

    let insertQuery: string;
    let insertValues: any[];

    if (assigned_at) {
      insertQuery =
        "INSERT INTO assignments (user_id, computer_id, assigned_at) VALUES (?, ?, ?)";
      insertValues = [user_id, found_computer_id, assigned_at];
    } else {
      insertQuery =
        "INSERT INTO assignments (user_id, computer_id) VALUES (?, ?)";
      insertValues = [user_id, found_computer_id];
    }

    const [assignmentResultHeader] = await connection.execute<ResultSetHeader>(
      insertQuery,
      insertValues
    );
    const insertId = assignmentResultHeader.insertId;

    await connection.execute(
      "UPDATE computers SET is_assigned = TRUE WHERE id = ?",
      [found_computer_id]
    );

    await connection.commit();
    res.status(201).json({
      success: true,
      assignmentId: insertId,
      message: "Equipo asignado al usuario correctamente.",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error al crear la asignación:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor al intentar crear la asignación.",
    });
  } finally {
    connection.release();
  }
};

/**
 * @description Obtiene todas las asignaciones de computadoras a usuarios.
 * @param req Request
 * @param res Response con la lista de asignaciones.
 */
export const getAssignments = async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT
        a.id as id,
        a.user_id,
        u.name as user_name,
        u.email as user_email,
        a.computer_id,
        c.serial_number as computer_serial,
        c.model as computer_model,
        a.assigned_at,
        a.status as status
      FROM assignments a
      JOIN users u ON a.user_id = u.id
      JOIN computers c ON a.computer_id = c.id
      ORDER BY a.assigned_at DESC
    `;
    const queryResult: QueryResult = await executeQuery(query);

    if (!Array.isArray(queryResult.results)) {
      console.error(
        "Error al obtener asignaciones: formato de resultados inesperado."
      );
      res.status(500).json({
        success: false,
        error: "Error interno del servidor al recuperar datos de asignaciones.",
      });
    }
    res.status(200).json({ success: true, data: queryResult.results });
  } catch (error) {
    console.error("Error al obtener asignaciones:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor al obtener las asignaciones.",
    });
  }
};

/**
 * @description Obtiene una asignación específica por su ID.
 * @param req Request con el ID de la asignación en los parámetros.
 * @param res Response con los datos de la asignación.
 */
export const getAssignmentById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    res
      .status(400)
      .json({ success: false, error: "El ID de la asignación es requerido." });
  }
  try {
    const query = `
        SELECT
            a.id as assignment_id,
            a.user_id,
            u.name as user_name,
            u.email as user_email,
            a.computer_id,
            c.serial_number as computer_serial,
            c.model as computer_model,
            a.assigned_at,
            a.status
        FROM assignments a
        JOIN users u ON a.user_id = u.id
        JOIN computers c ON a.computer_id = c.id
        WHERE a.id = ?
        `;
    const queryResult = await executeQuery(query, [id]);
    const assignment = (queryResult.results as RowDataPacket[])[0];

    if (!assignment) {
      res
        .status(404)
        .json({ success: false, error: "Asignación no encontrada." });
    }
    res.status(200).json({ success: true, data: assignment });
  } catch (error) {
    console.error(`Error al obtener asignación por ID (${id}):`, error);
    res
      .status(500)
      .json({ success: false, error: "Error interno del servidor." });
  }
};

/**
 * @description Elimina una asignación de computadora.
 * @param req Request con el ID de la asignación en los parámetros.
 * @param res Response
 */
export const deleteAssignment = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    res
      .status(400)
      .json({ success: false, error: "El ID de la asignación es requerido." });
  }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [assignmentCheckRows] = await connection.execute<RowDataPacket[]>(
      "SELECT computer_id FROM assignments WHERE id = ?",
      [id]
    );
    const assignment = assignmentCheckRows[0];

    if (!assignment) {
      await connection.rollback();
      res
        .status(404)
        .json({ success: false, error: "Asignación no encontrada." });
    }

    await connection.execute("DELETE FROM assignments WHERE id = ?", [id]);
    await connection.execute(
      "UPDATE computers SET is_assigned = FALSE WHERE id = ?",
      [assignment.computer_id]
    );

    await connection.commit();
    res.status(200).json({
      success: true,
      message: "Asignación eliminada y equipo desasignado correctamente.",
    });
  } catch (error) {
    await connection.rollback();
    console.error(`Error al eliminar asignación (${id}):`, error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor al eliminar la asignación.",
    });
  } finally {
    connection.release();
  }
};

/**
 * @description Actualiza una asignación existente, permitiendo cambiar el usuario y/o la computadora.
 * @param req Request con el ID de la asignación en los params, y user_id, computer_serial_number, assigned_at, status en el body.
 * @param res Response
 */
export const updateAssignment = async (req: Request, res: Response) => {
  const { id: assignmentId } = req.params;
  const {
    user_id: new_user_id,
    computer_serial_number: new_computer_serial_number,
    assigned_at: new_assigned_at,
    status: new_status,
  } = req.body;

  if (
    new_user_id === undefined &&
    new_computer_serial_number === undefined &&
    new_assigned_at === undefined &&
    new_status === undefined
  ) {
    res.status(400).json({
      success: false,
      error:
        "Se requiere al menos user_id, computer_serial_number, assigned_at o status para actualizar.",
    });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const [currentAssignmentRows] = await connection.execute<RowDataPacket[]>(
      "SELECT user_id, computer_id, assigned_at, status FROM assignments WHERE id = ?",
      [assignmentId]
    );
    const currentAssignment = currentAssignmentRows[0];

    if (!currentAssignment) {
      await connection.rollback();
      res
        .status(404)
        .json({ success: false, error: "Asignación no encontrada." });
    }

    const {
      user_id: current_user_id,
      computer_id: current_computer_id,
      assigned_at: current_assigned_at_raw,
      status: current_status,
    } = currentAssignment;

    const fieldsToUpdate: string[] = [];
    const valuesForUpdateQuery: (string | number | null)[] = [];
    let computerHasChanged = false;
    let new_computer_id_to_assign: number | null = null;

    if (new_user_id !== undefined && new_user_id !== current_user_id) {
      const [userCheckRows] = await connection.execute<RowDataPacket[]>(
        "SELECT id FROM users WHERE id = ?",
        [new_user_id]
      );
      if (userCheckRows.length === 0) {
        await connection.rollback();
        res.status(404).json({
          success: false,
          error:
            "El nuevo user_id proporcionado no corresponde a un usuario existente.",
        });
      }
      fieldsToUpdate.push("user_id = ?");
      valuesForUpdateQuery.push(new_user_id);
    }

    if (new_computer_serial_number !== undefined) {
      const [newComputerRows] = await connection.execute<RowDataPacket[]>(
        "SELECT id, is_assigned FROM computers WHERE serial_number = ?",
        [new_computer_serial_number]
      );
      const newComputer = newComputerRows[0];

      if (!newComputer) {
        await connection.rollback();
        res.status(404).json({
          success: false,
          error: "El equipo con el número de serie proporcionado no existe.",
        });
      }

      new_computer_id_to_assign = newComputer.id;

      if (new_computer_id_to_assign !== current_computer_id) {
        if (newComputer.is_assigned) {
          await connection.rollback();
          res.status(409).json({
            success: false,
            error:
              "El nuevo equipo de cómputo (por serial) ya está asignado a otro usuario.",
          });
        } else {
          fieldsToUpdate.push("computer_id = ?");
          valuesForUpdateQuery.push(new_computer_id_to_assign);
          computerHasChanged = true;
        }
      }
    }

    if (new_assigned_at !== undefined) {
      let current_assigned_at_str: string | null = null;
      if (current_assigned_at_raw instanceof Date) {
        current_assigned_at_str = current_assigned_at_raw
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
      }

      if (new_assigned_at !== current_assigned_at_str) {
        fieldsToUpdate.push("assigned_at = ?");
        valuesForUpdateQuery.push(new_assigned_at);
      }
    }

    if (new_status !== undefined && new_status !== current_status) {
      if (
        typeof new_status !== "string" ||
        !ALLOWED_ASSIGNMENT_STATUSES.includes(new_status)
      ) {
        await connection.rollback();
        res.status(400).json({
          success: false,
          error: `El estado proporcionado no es válido. Permitidos: ${ALLOWED_ASSIGNMENT_STATUSES.join(
            ", "
          )}.`,
        });
      }
      fieldsToUpdate.push("status = ?");
      valuesForUpdateQuery.push(new_status);
    }

    if (fieldsToUpdate.length === 0) {
      res.status(200).json({
        success: true,
        message:
          "No se realizaron cambios en la asignación ya que los datos proporcionados son idénticos a los actuales o no se proporcionaron campos válidos para actualizar.",
      });
    }

    const updateQuery = `UPDATE assignments SET ${fieldsToUpdate.join(
      ", "
    )} WHERE id = ?`;
    valuesForUpdateQuery.push(assignmentId);
    await connection.execute(updateQuery, valuesForUpdateQuery);

    if (computerHasChanged && new_computer_id_to_assign !== null) {
      if (
        current_computer_id !== null &&
        current_computer_id !== new_computer_id_to_assign
      ) {
        await connection.execute(
          "UPDATE computers SET is_assigned = FALSE WHERE id = ?",
          [current_computer_id]
        );
      }
      await connection.execute(
        "UPDATE computers SET is_assigned = TRUE WHERE id = ?",
        [new_computer_id_to_assign]
      );
    }

    await connection.commit();
    res.status(200).json({
      success: true,
      message: "Asignación actualizada correctamente.",
    });
  } catch (error) {
    await connection.rollback();
    console.error(`Error al actualizar asignación (${assignmentId}):`, error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor al actualizar la asignación.",
    });
  } finally {
    connection.release();
  }
};

export const getComputers = async (req: Request, res: Response) => {
  try {
    const query = "SELECT id, serial_number, model, is_assigned FROM computers ORDER BY id ASC";
    const queryResult: QueryResult = await executeQuery(query);

    if (!Array.isArray(queryResult.results)) {
      console.error("Error al obtener equipos: formato de resultados inesperado.");
      res.status(500).json({
        success: false,
        error: "Error interno del servidor al recuperar datos de equipos.",
      });
    }
    res.status(200).json({ success: true, data: queryResult.results });
  } catch (error) {
    console.error("Error al obtener equipos de cómputo:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor al obtener los equipos de cómputo.",
    });
  }
};

