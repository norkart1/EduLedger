import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, initializeAdmin } from "./storage";
import { upload } from "./middleware/upload";
import { reportService } from "./services/reports";
import { insertStudentSchema, insertTransactionSchema, adminLoginSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import path from "path";
import fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize admin user
  await initializeAdmin();

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    const filePath = path.join(process.cwd(), 'uploads', req.path);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  });

  // Student routes
  app.post("/api/students", upload.single('profileImage'), async (req, res) => {
    try {
      const validatedData = insertStudentSchema.parse(req.body);
      
      let profileImagePath = null;
      if (req.file) {
        profileImagePath = `/uploads/${req.file.filename}`;
      }

      const student = await storage.createStudent({
        ...validatedData,
        profileImage: profileImagePath
      });

      res.json(student);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/students/:id", async (req, res) => {
    try {
      const student = await storage.getStudent(req.params.id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json(student);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/students", async (req, res) => {
    try {
      const students = await storage.getAllStudents();
      
      // Calculate totals for each student
      const studentsWithTotals = await Promise.all(
        students.map(async (student) => {
          const transactions = await storage.getTransactionsByStudent(student.id);
          const totalDeposits = transactions
            .filter(t => t.type === 'deposit')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
          const totalWithdrawals = transactions
            .filter(t => t.type === 'withdrawal')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
          
          return {
            ...student,
            totalDeposits: totalDeposits.toFixed(2),
            totalWithdrawals: totalWithdrawals.toFixed(2)
          };
        })
      );
      
      res.json(studentsWithTotals);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/students/:id", async (req, res) => {
    try {
      const { name, balance } = req.body;
      
      if (name) {
        // Update student name (would need additional endpoint)
        return res.status(400).json({ message: "Name update not implemented" });
      }
      
      if (balance !== undefined) {
        const student = await storage.updateStudentBalance(req.params.id, balance);
        res.json(student);
      } else {
        res.status(400).json({ message: "No valid fields to update" });
      }
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/students/:id", async (req, res) => {
    try {
      const student = await storage.getStudent(req.params.id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      await storage.deleteStudent(req.params.id);
      res.json({ message: "Student account deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Transaction routes
  app.get("/api/students/:id/transactions", async (req, res) => {
    try {
      const transactions = await storage.getTransactionsByStudent(req.params.id);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedData);
      res.json(transaction);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Admin routes
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = adminLoginSchema.parse(req.body);
      
      const admin = await storage.getAdminByUsername(username);
      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, admin.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Simple session management (in production, use proper JWT or sessions)
      res.json({ success: true, admin: { id: admin.id, username: admin.username } });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Analytics routes
  app.get("/api/analytics", async (req, res) => {
    try {
      const totalBalance = await storage.getTotalBankBalance();
      const totalAccounts = await storage.getTotalAccountsCount();
      const monthlyTransactions = await storage.getMonthlyTransactionCount();

      res.json({
        totalBalance,
        totalAccounts,
        monthlyTransactions
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Report routes
  app.get("/api/reports/monthly/pdf", async (req, res) => {
    try {
      const pdfBuffer = await reportService.generateMonthlyPDFReport();
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="monthly-report-${new Date().toISOString().slice(0, 7)}.pdf"`);
      res.send(pdfBuffer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/reports/yearly/pdf", async (req, res) => {
    try {
      const pdfBuffer = await reportService.generateYearlyPDFReport();
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="yearly-report-${new Date().getFullYear()}.pdf"`);
      res.send(pdfBuffer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/reports/monthly/excel", async (req, res) => {
    try {
      const excelBuffer = await reportService.generateMonthlyExcelReport();
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="monthly-report-${new Date().toISOString().slice(0, 7)}.xlsx"`);
      res.send(excelBuffer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/reports/yearly/excel", async (req, res) => {
    try {
      const excelBuffer = await reportService.generateYearlyExcelReport();
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="yearly-report-${new Date().getFullYear()}.xlsx"`);
      res.send(excelBuffer);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
