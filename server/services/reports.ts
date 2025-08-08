import PDFKit from "pdfkit";
import * as XLSX from "xlsx";
import { storage } from "../storage";

export class ReportService {
  async generateMonthlyPDFReport(): Promise<Buffer> {
    const pdf = new PDFKit();
    const chunks: Buffer[] = [];

    pdf.on('data', chunk => chunks.push(chunk));
    
    return new Promise(async (resolve) => {
      pdf.on('end', () => resolve(Buffer.concat(chunks)));

      // Get current month data
      const startDate = new Date();
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);

      const transactions = await storage.getTransactionsByDateRange(startDate, endDate);
      const totalBalance = await storage.getTotalBankBalance();
      const totalAccounts = await storage.getTotalAccountsCount();

      // PDF content
      pdf.fontSize(20).text('Monthly Banking Report', 100, 100);
      pdf.fontSize(14).text(`Report Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, 100, 140);
      
      pdf.text(`Total Bank Balance: $${totalBalance}`, 100, 180);
      pdf.text(`Total Accounts: ${totalAccounts}`, 100, 200);
      pdf.text(`Monthly Transactions: ${transactions.length}`, 100, 220);

      let y = 260;
      pdf.fontSize(16).text('Recent Transactions:', 100, y);
      y += 30;

      pdf.fontSize(10);
      transactions.slice(0, 20).forEach(transaction => {
        pdf.text(`${new Date(transaction.createdAt).toLocaleDateString()} - ${transaction.type.toUpperCase()} - $${transaction.amount}`, 100, y);
        y += 15;
        if (y > 750) return; // Page limit
      });

      pdf.end();
    });
  }

  async generateYearlyPDFReport(): Promise<Buffer> {
    const pdf = new PDFKit();
    const chunks: Buffer[] = [];

    pdf.on('data', chunk => chunks.push(chunk));
    
    return new Promise(async (resolve) => {
      pdf.on('end', () => resolve(Buffer.concat(chunks)));

      // Get current year data
      const startDate = new Date();
      startDate.setMonth(0, 1);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date();
      endDate.setMonth(11, 31);
      endDate.setHours(23, 59, 59, 999);

      const transactions = await storage.getTransactionsByDateRange(startDate, endDate);
      const totalBalance = await storage.getTotalBankBalance();
      const totalAccounts = await storage.getTotalAccountsCount();

      // PDF content
      pdf.fontSize(20).text('Yearly Banking Report', 100, 100);
      pdf.fontSize(14).text(`Report Period: ${startDate.getFullYear()}`, 100, 140);
      
      pdf.text(`Total Bank Balance: $${totalBalance}`, 100, 180);
      pdf.text(`Total Accounts: ${totalAccounts}`, 100, 200);
      pdf.text(`Yearly Transactions: ${transactions.length}`, 100, 220);

      // Monthly breakdown
      const monthlyStats = new Map<number, { deposits: number, withdrawals: number, count: number }>();
      
      transactions.forEach(tx => {
        const month = new Date(tx.createdAt).getMonth();
        const stats = monthlyStats.get(month) || { deposits: 0, withdrawals: 0, count: 0 };
        
        if (tx.type === 'deposit') {
          stats.deposits += parseFloat(tx.amount);
        } else {
          stats.withdrawals += parseFloat(tx.amount);
        }
        stats.count++;
        
        monthlyStats.set(month, stats);
      });

      let y = 260;
      pdf.fontSize(16).text('Monthly Breakdown:', 100, y);
      y += 30;

      pdf.fontSize(10);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      monthlyStats.forEach((stats, month) => {
        pdf.text(`${monthNames[month]}: ${stats.count} transactions, $${stats.deposits.toFixed(2)} deposits, $${stats.withdrawals.toFixed(2)} withdrawals`, 100, y);
        y += 15;
      });

      pdf.end();
    });
  }

  async generateMonthlyExcelReport(): Promise<Buffer> {
    const startDate = new Date();
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1, 0);
    endDate.setHours(23, 59, 59, 999);

    const transactions = await storage.getTransactionsByDateRange(startDate, endDate);
    const students = await storage.getAllStudents();

    const workbook = XLSX.utils.book_new();

    // Transactions sheet
    const transactionData = transactions.map(tx => ({
      Date: new Date(tx.createdAt).toLocaleDateString(),
      Type: tx.type.toUpperCase(),
      Amount: parseFloat(tx.amount),
      'Balance After': parseFloat(tx.balanceAfter),
      Description: tx.description || ''
    }));

    const transactionSheet = XLSX.utils.json_to_sheet(transactionData);
    XLSX.utils.book_append_sheet(workbook, transactionSheet, 'Transactions');

    // Students sheet
    const studentData = students.map(student => ({
      'Account Number': student.accountNumber,
      Name: student.name,
      Email: student.email || '',
      Balance: parseFloat(student.balance),
      'Created Date': new Date(student.createdAt).toLocaleDateString()
    }));

    const studentSheet = XLSX.utils.json_to_sheet(studentData);
    XLSX.utils.book_append_sheet(workbook, studentSheet, 'Students');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async generateYearlyExcelReport(): Promise<Buffer> {
    const startDate = new Date();
    startDate.setMonth(0, 1);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date();
    endDate.setMonth(11, 31);
    endDate.setHours(23, 59, 59, 999);

    const transactions = await storage.getTransactionsByDateRange(startDate, endDate);
    const students = await storage.getAllStudents();

    const workbook = XLSX.utils.book_new();

    // Transactions sheet
    const transactionData = transactions.map(tx => ({
      Date: new Date(tx.createdAt).toLocaleDateString(),
      Type: tx.type.toUpperCase(),
      Amount: parseFloat(tx.amount),
      'Balance After': parseFloat(tx.balanceAfter),
      Description: tx.description || ''
    }));

    const transactionSheet = XLSX.utils.json_to_sheet(transactionData);
    XLSX.utils.book_append_sheet(workbook, transactionSheet, 'Transactions');

    // Students sheet
    const studentData = students.map(student => ({
      'Account Number': student.accountNumber,
      Name: student.name,
      Email: student.email || '',
      Balance: parseFloat(student.balance),
      'Created Date': new Date(student.createdAt).toLocaleDateString()
    }));

    const studentSheet = XLSX.utils.json_to_sheet(studentData);
    XLSX.utils.book_append_sheet(workbook, studentSheet, 'Students');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}

export const reportService = new ReportService();
