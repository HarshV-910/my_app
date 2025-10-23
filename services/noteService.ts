import { supabase } from '../lib/supabase';
import { Note } from '../types';

export const noteService = {
  // Get all notes
  async getAllNotes(): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('date_time', { ascending: false });

    if (error) throw error;

    return data.map(note => ({
      id: note.id,
      memberId: note.member_id,
      eventId: note.event_id,
      content: note.content,
      imageUrls: note.image_urls,
      dateTime: note.date_time,
    }));
  },

  // Get notes by event
  async getNotesByEvent(eventId: string): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('event_id', eventId)
      .order('date_time', { ascending: false });

    if (error) throw error;

    return data.map(note => ({
      id: note.id,
      memberId: note.member_id,
      eventId: note.event_id,
      content: note.content,
      imageUrls: note.image_urls,
      dateTime: note.date_time,
    }));
  },

  // Get notes by member
  async getNotesByMember(memberId: string): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('member_id', memberId)
      .order('date_time', { ascending: false });

    if (error) throw error;

    return data.map(note => ({
      id: note.id,
      memberId: note.member_id,
      eventId: note.event_id,
      content: note.content,
      imageUrls: note.image_urls,
      dateTime: note.date_time,
    }));
  },

  // Create note
  async createNote(noteData: {
    memberId: string;
    eventId: string;
    content: string;
    imageUrls?: string[];
  }) {
    const { data, error } = await supabase
      .from('notes')
      .insert({
        member_id: noteData.memberId,
        event_id: noteData.eventId,
        content: noteData.content,
        image_urls: noteData.imageUrls || [],
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      memberId: data.member_id,
      eventId: data.event_id,
      content: data.content,
      imageUrls: data.image_urls,
      dateTime: data.date_time,
    };
  },

  // Update note
  async updateNote(noteId: string, content: string, imageUrls?: string[]) {
    const { error } = await supabase
      .from('notes')
      .update({
        content,
        image_urls: imageUrls || [],
      })
      .eq('id', noteId);

    if (error) throw error;
  },

  // Delete note
  async deleteNote(noteId: string) {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId);

    if (error) throw error;
  },
};
