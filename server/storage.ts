import { students, transactions, admins, type Student, type InsertStudent, type Transaction, type InsertTransaction, type Admin, type InsertAdmin } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sum, count, gte, lte, and } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // Student operations
  getStudent(id: string): Promise<Student | undefined>;
  getStudentByAccountNumber(accountNumber: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudentBalance(id: string, newBalance: string): Promise<Student>;
  getAllStudents(): Promise<Student[]>;
  
  // Transaction operations
  getTransactionsByStudent(studentId: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]>;
  
  // Admin operations
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  
  // Analytics
  getTotalBankBalance(): Promise<string>;
  getTotalAccountsCount(): Promise<number>;
  getMonthlyTransactionCount(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getStudent(id: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student || undefined;
  }

  async getStudentByAccountNumber(accountNumber: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.accountNumber, accountNumber));
    return student || undefined;
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    // Generate account number
    const accountNumber = `ACC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    
    const [student] = await db
      .insert(students)
      .values({ ...insertStudent, accountNumber })
      .returning();
    return student;
  }

  async updateStudentBalance(id: string, newBalance: string): Promise<Student> {
    const [student] = await db
      .update(students)
      .set({ balance: newBalance })
      .where(eq(students.id, id))
      .returning();
    return student;
  }

  async getAllStudents(): Promise<Student[]> {
    return await db.select().from(students).orderBy(desc(students.createdAt));
  }

  async getTransactionsByStudent(studentId: string): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(eq(transactions.studentId, studentId))
      .orderBy(desc(transactions.createdAt));
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    // Get current balance
    const student = await this.getStudent(insertTransaction.studentId);
    if (!student) throw new Error("Student not found");

    const currentBalance = parseFloat(student.balance);
    const transactionAmount = parseFloat(insertTransaction.amount);
    
    let newBalance: number;
    if (insertTransaction.type === 'deposit') {
      newBalance = currentBalance + transactionAmount;
    } else if (insertTransaction.type === 'withdrawal') {
      if (currentBalance < transactionAmount) {
        throw new Error("Insufficient funds");
      }
      newBalance = currentBalance - transactionAmount;
    } else {
      throw new Error("Invalid transaction type");
    }

    // Create transaction with calculated balance
    const [transaction] = await db
      .insert(transactions)
      .values({
        ...insertTransaction,
        balanceAfter: newBalance.toFixed(2)
      })
      .returning();

    // Update student balance
    await this.updateStudentBalance(insertTransaction.studentId, newBalance.toFixed(2));

    return transaction;
  }

  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(and(
        gte(transactions.createdAt, startDate),
        lte(transactions.createdAt, endDate)
      ))
      .orderBy(desc(transactions.createdAt));
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.username, username));
    return admin || undefined;
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const hashedPassword = await bcrypt.hash(insertAdmin.password, 10);
    const [admin] = await db
      .insert(admins)
      .values({ ...insertAdmin, password: hashedPassword })
      .returning();
    return admin;
  }

  async getTotalBankBalance(): Promise<string> {
    const result = await db.select({ total: sum(students.balance) }).from(students);
    return result[0]?.total || "0.00";
  }

  async getTotalAccountsCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(students);
    return result[0]?.count || 0;
  }

  async getMonthlyTransactionCount(): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const result = await db.select({ count: count() })
      .from(transactions)
      .where(gte(transactions.createdAt, startOfMonth));
    
    return result[0]?.count || 0;
  }
}

export const storage = new DatabaseStorage();

// Initialize admin user if not exists
export async function initializeAdmin() {
  try {
    const existingAdmin = await storage.getAdminByUsername("admin");
    if (!existingAdmin) {
      await storage.createAdmin({
        username: "admin",
        password: "123@Admin"
      });
      console.log("Default admin user created");
    }
  } catch (error) {
    console.error("Error initializing admin:", error);
  }
}
