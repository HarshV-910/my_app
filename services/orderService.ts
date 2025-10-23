import { supabase } from '../lib/supabase';
import { Order, PaymentStatus } from '../types';

export const orderService = {
  // Get all orders
  async getAllOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('date_time', { ascending: false });

    if (error) throw error;

    return data.map(order => ({
      id: order.id,
      memberId: order.member_id,
      eventId: order.event_id,
      itemId: order.item_id,
      customerName: order.customer_name,
      quantityKg: Number(order.quantity_kg),
      amountInr: Number(order.amount_inr),
      paymentStatus: order.payment_status as PaymentStatus,
      verified: order.verified,
      edited: order.edited,
      dateTime: order.date_time,
    }));
  },

  // Get orders by event
  async getOrdersByEvent(eventId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('event_id', eventId)
      .order('date_time', { ascending: false });

    if (error) throw error;

    return data.map(order => ({
      id: order.id,
      memberId: order.member_id,
      eventId: order.event_id,
      itemId: order.item_id,
      customerName: order.customer_name,
      quantityKg: Number(order.quantity_kg),
      amountInr: Number(order.amount_inr),
      paymentStatus: order.payment_status as PaymentStatus,
      verified: order.verified,
      edited: order.edited,
      dateTime: order.date_time,
    }));
  },

  // Get orders by member
  async getOrdersByMember(memberId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('member_id', memberId)
      .order('date_time', { ascending: false });

    if (error) throw error;

    return data.map(order => ({
      id: order.id,
      memberId: order.member_id,
      eventId: order.event_id,
      itemId: order.item_id,
      customerName: order.customer_name,
      quantityKg: Number(order.quantity_kg),
      amountInr: Number(order.amount_inr),
      paymentStatus: order.payment_status as PaymentStatus,
      verified: order.verified,
      edited: order.edited,
      dateTime: order.date_time,
    }));
  },

  // Create order
  async createOrder(orderData: {
    memberId: string;
    eventId: string;
    itemId: string;
    customerName: string;
    quantityKg: number;
    amountInr: number;
    verified?: boolean;
  }) {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        member_id: orderData.memberId,
        event_id: orderData.eventId,
        item_id: orderData.itemId,
        customer_name: orderData.customerName,
        quantity_kg: orderData.quantityKg,
        amount_inr: orderData.amountInr,
        verified: orderData.verified || false,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      memberId: data.member_id,
      eventId: data.event_id,
      itemId: data.item_id,
      customerName: data.customer_name,
      quantityKg: Number(data.quantity_kg),
      amountInr: Number(data.amount_inr),
      paymentStatus: data.payment_status as PaymentStatus,
      verified: data.verified,
      edited: data.edited,
      dateTime: data.date_time,
    };
  },

  // Update order
  async updateOrder(orderId: string, updates: {
    customerName?: string;
    itemId?: string;
    quantityKg?: number;
    amountInr?: number;
  }) {
    const { error } = await supabase
      .from('orders')
      .update({
        customer_name: updates.customerName,
        item_id: updates.itemId,
        quantity_kg: updates.quantityKg,
        amount_inr: updates.amountInr,
        edited: true,
        verified: false, // Reset verification on edit
      })
      .eq('id', orderId);

    if (error) throw error;
  },

  // Verify order
  async verifyOrder(orderId: string) {
    const { error } = await supabase
      .from('orders')
      .update({ verified: true, edited: false })
      .eq('id', orderId);

    if (error) throw error;
  },

  // Update payment status
  async updatePaymentStatus(orderId: string, status: PaymentStatus) {
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: status })
      .eq('id', orderId);

    if (error) throw error;
  },

  // Delete order
  async deleteOrder(orderId: string) {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) throw error;
  },
};
