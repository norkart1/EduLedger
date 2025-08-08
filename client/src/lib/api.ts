import { apiRequest } from "./queryClient";

export interface Student {
  id: string;
  name: string;
  email?: string;
  profileImage?: string;
  accountNumber: string;
  balance: string;
  createdAt: string;
  totalDeposits?: string;
  totalWithdrawals?: string;
}

export interface Transaction {
  id: string;
  studentId: string;
  type: 'deposit' | 'withdrawal';
  amount: string;
  balanceAfter: string;
  description?: string;
  createdAt: string;
}

export interface Analytics {
  totalBalance: string;
  totalAccounts: number;
  monthlyTransactions: number;
}

export const api = {
  // Student operations
  async createStudent(formData: FormData): Promise<Student> {
    const response = await fetch('/api/students', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
    
    return response.json();
  },

  async getStudent(id: string): Promise<Student> {
    const response = await apiRequest('GET', `/api/students/${id}`);
    return response.json();
  },

  async getAllStudents(): Promise<Student[]> {
    const response = await apiRequest('GET', '/api/students');
    return response.json();
  },

  async updateStudent(id: string, data: { balance?: string }): Promise<Student> {
    const response = await apiRequest('PUT', `/api/students/${id}`, data);
    return response.json();
  },

  // Transaction operations
  async getStudentTransactions(studentId: string): Promise<Transaction[]> {
    const response = await apiRequest('GET', `/api/students/${studentId}/transactions`);
    return response.json();
  },

  async createTransaction(data: { studentId: string; type: 'deposit' | 'withdrawal'; amount: string; description?: string }): Promise<Transaction> {
    const response = await apiRequest('POST', '/api/transactions', data);
    return response.json();
  },

  // Admin operations
  async adminLogin(credentials: { username: string; password: string }) {
    const response = await apiRequest('POST', '/api/admin/login', credentials);
    return response.json();
  },

  // Analytics
  async getAnalytics(): Promise<Analytics> {
    const response = await apiRequest('GET', '/api/analytics');
    return response.json();
  },

  // Reports
  downloadMonthlyPDF() {
    window.open('/api/reports/monthly/pdf', '_blank');
  },

  downloadYearlyPDF() {
    window.open('/api/reports/yearly/pdf', '_blank');
  },

  downloadMonthlyExcel() {
    window.open('/api/reports/monthly/excel', '_blank');
  },

  downloadYearlyExcel() {
    window.open('/api/reports/yearly/excel', '_blank');
  },
};
