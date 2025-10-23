import { supabase } from '../lib/supabase';
import { Expense } from '../types';

export const expenseService = {
  // Get all expenses
  async getAllExpenses(): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date_time', { ascending: false });

    if (error) throw error;

    return data.map(expense => ({
      id: expense.id,
      addedById: expense.added_by_id,
      eventId: expense.event_id,
      name: expense.name,
      amountInr: Number(expense.amount_inr),
      verified: expense.verified,
      dateTime: expense.date_time,
    }));
  },

  // Get expenses by event
  async getExpensesByEvent(eventId: string): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('event_id', eventId)
      .order('date_time', { ascending: false });

    if (error) throw error;

    return data.map(expense => ({
      id: expense.id,
      addedById: expense.added_by_id,
      eventId: expense.event_id,
      name: expense.name,
      amountInr: Number(expense.amount_inr),
      verified: expense.verified,
      dateTime: expense.date_time,
    }));
  },

  // Create expense
  async createExpense(expenseData: {
    addedById: string;
    eventId: string;
    name: string;
    amountInr: number;
    verified?: boolean;
  }) {
    const { data, error } = await supabase
      .from('expenses')
      .insert({
        added_by_id: expenseData.addedById,
        event_id: expenseData.eventId,
        name: expenseData.name,
        amount_inr: expenseData.amountInr,
        verified: expenseData.verified || false,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      addedById: data.added_by_id,
      eventId: data.event_id,
      name: data.name,
      amountInr: Number(data.amount_inr),
      verified: data.verified,
      dateTime: data.date_time,
    };
  },

  // Update expense
  async updateExpense(expenseId: string, name: string, amountInr: number) {
    const { error } = await supabase
      .from('expenses')
      .update({
        name,
        amount_inr: amountInr,
      })
      .eq('id', expenseId);

    if (error) throw error;
  },

  // Verify expense
  async verifyExpense(expenseId: string) {
    const { error } = await supabase
      .from('expenses')
      .update({ verified: true })
      .eq('id', expenseId);

    if (error) throw error;
  },

  // Delete expense
  async deleteExpense(expenseId: string) {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);

    if (error) throw error;
  },
};
