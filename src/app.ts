import express, { Request, Response } from "express";
import cors from "cors";
import personnelManagementRoutes from "./routes/personnelManagementRoutes";
import { login } from "./controllers/authController";
import { protect } from "./middleware/authMiddleware";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("API funcionando correctamente 🚀");
});

app.post("/login", login);
app.use("/personnel-management", protect, personnelManagementRoutes);

export default app;