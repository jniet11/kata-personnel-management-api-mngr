import express, { Request, Response } from "express";
import cors from "cors";
import personnelManagementRoutes from "./routes/personnelManagementRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("API funcionando correctamente 🚀");
});

app.use("/personnel-management", personnelManagementRoutes);

export default app;