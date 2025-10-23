import { supabase } from '../lib/supabase';
import { Event } from '../types';

export const eventService = {
  // Get all events
  async getAllEvents(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('year', { ascending: false });

    if (error) throw error;

    return data.map(event => ({
      id: event.id,
      name: event.name,
      year: event.year,
      imageUrl: event.image_url,
      createdAt: event.created_at,
    }));
  },

  // Create event
  async createEvent(name: string, year: number, imageUrl?: string) {
    const { data, error } = await supabase
      .from('events')
      .insert({
        name,
        year,
        image_url: imageUrl || `https://picsum.photos/seed/${name}${year}/400/300`,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      year: data.year,
      imageUrl: data.image_url,
      createdAt: data.created_at,
    };
  },

  // Delete event
  async deleteEvent(eventId: string) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) throw error;
  },
};
