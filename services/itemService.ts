import { supabase } from '../lib/supabase';
import { Item } from '../types';

export const itemService = {
  // Get items by event
  async getItemsByEvent(eventId: string): Promise<Item[]> {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('event_id', eventId)
      .order('name');

    if (error) throw error;

    return data.map(item => ({
      id: item.id,
      eventId: item.event_id,
      name: item.name,
      availableStockKg: Number(item.available_stock_kg),
      createdAt: item.created_at,
    }));
  },

  // Get all items
  async getAllItems(): Promise<Item[]> {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('name');

    if (error) throw error;

    return data.map(item => ({
      id: item.id,
      eventId: item.event_id,
      name: item.name,
      availableStockKg: Number(item.available_stock_kg),
      createdAt: item.created_at,
    }));
  },

  // Create item
  async createItem(eventId: string, name: string, initialStock: number) {
    const { data, error } = await supabase
      .from('items')
      .insert({
        event_id: eventId,
        name,
        available_stock_kg: initialStock,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      eventId: data.event_id,
      name: data.name,
      availableStockKg: Number(data.available_stock_kg),
      createdAt: data.created_at,
    };
  },

  // Update stock
  async updateStock(itemId: string, newStock: number) {
    const { error } = await supabase
      .from('items')
      .update({ available_stock_kg: newStock })
      .eq('id', itemId);

    if (error) throw error;
  },

  // Add stock
  async addStock(itemId: string, amount: number) {
    // First get current stock
    const { data: item, error: fetchError } = await supabase
      .from('items')
      .select('available_stock_kg')
      .eq('id', itemId)
      .single();

    if (fetchError) throw fetchError;

    const newStock = Number(item.available_stock_kg) + amount;

    const { error } = await supabase
      .from('items')
      .update({ available_stock_kg: newStock })
      .eq('id', itemId);

    if (error) throw error;
  },

  // Delete item
  async deleteItem(itemId: string) {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
  },
};
