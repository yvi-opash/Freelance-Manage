import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";




import authRoutes from "./routes/auth.routes";
import clientRoutes from "./routes/client.routes";
import projectRoutes from "./routes/project.routes";
import timeRoutes from "./routes/time.routes";
import invoiceRoutes from "./routes/invoice.routes";
import expenseRoutes from "./routes/expense.routes";
import dashboardRoutes from "./routes/dashboard.routes";

import { errorHandler } from "./middleware/error.middleware";


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/time", timeRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/dashboard", dashboardRoutes);


app.use(errorHandler);