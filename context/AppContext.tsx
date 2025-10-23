import React, { createContext, ReactNode, useState, useEffect } from 'react';
import { User, Role, UserStatus, Event, Item, Order, Expense, StoredFile, Note, PaymentStatus } from '../types';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { eventService } from '../services/eventService';
import { itemService } from '../services/itemService';
import { orderService } from '../services/orderService';
import { expenseService } from '../services/expenseService';
import { noteService } from '../services/noteService';
import { fileService } from '../services/fileService';
import { supabase } from '../lib/supabase';

export interface NotificationType {
    message: string;
    type: 'success' | 'error';
}

export interface AppContextType {
    currentUser: User | null;
    users: User[];
    events: Event[];
    items: Item[];
    orders: Order[];
    expenses: Expense[];
    storedFiles: StoredFile[];
    notes: Note[];
    error: string | null;
    notification: NotificationType | null;
    loading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    logout: () => Promise<void>;
    requestToJoin: (name: string, email: string, pass: string) => Promise<void>;
    clearError: () => void;
    clearNotification: () => void;
    showNotification: (message: string, type?: 'success' | 'error') => void;
    approveMember: (memberId: string) => Promise<void>;
    createEvent: (name: string, year: number, imageUrl?: string) => Promise<void>;
    addItem: (eventId: string, name: string, initialStock: number) => Promise<void>;
    addStock: (itemId: string, amount: number) => Promise<void>;
    editItemStock: (itemId: string, newStock: number) => Promise<void>;
    addExpense: (addedById: string, eventId: string, name: string, amount: number) => Promise<void>;
    verifyExpense: (expenseId: string) => Promise<void>;
    editExpense: (expenseId: string, newName: string, newAmount: number) => Promise<void>;
    deleteExpense: (expenseId: string) => Promise<void>;
    uploadFile: (file: File) => Promise<void>;
    deleteFile: (fileId: string, filePath: string) => Promise<void>;
    verifyOrder: (orderId: string) => Promise<void>;
    rejectOrder: (orderId: string) => Promise<void>;
    addOrder: (memberId: string, eventId: string, itemId: string, customerName: string, quantityKg: number, amountInr: number) => Promise<void>;
    editOrder: (orderId: string, newValues: { customerName: string; itemId: string; quantityKg: number; amountInr: number; }) => Promise<void>;
    deleteOrder: (orderId: string) => Promise<void>;
    updateOrderPaymentStatus: (orderId: string, status: PaymentStatus) => Promise<void>;
    addNote: (memberId: string, eventId: string, content: string, imageUrls?: string[]) => Promise<void>;
    editNote: (noteId: string, newContent: string, newImageUrls?: string[]) => Promise<void>;
    deleteNote: (noteId: string) => Promise<void>;
    changePassword: (newPass: string) => Promise<void>;
    addConsumptionByHost: (memberId: string, eventId: string, itemId: string, customerName: string, quantityKg: number, amountInr: number) => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [storedFiles, setStoredFiles] = useState<StoredFile[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<NotificationType | null>(null);
    const [loading, setLoading] = useState(true);

    // Initialize auth and load data
    useEffect(() => {
        initializeAuth();
        
        // Set up auth state listener once
        const { data: authListener } = authService.onAuthStateChange(async (user) => {
            if (user && user.status === UserStatus.APPROVED) {
                setCurrentUser(user);
                await loadAllData();
            } else {
                setCurrentUser(null);
                clearAllData();
            }
        });

        return () => {
            authListener?.subscription?.unsubscribe();
        };
    }, []);

    // Realtime subscriptions
    useEffect(() => {
        if (!currentUser) return;

        const eventsChannel = supabase
            .channel('events_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
                loadEvents();
            })
            .subscribe();

        const itemsChannel = supabase
            .channel('items_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, () => {
                loadItems();
            })
            .subscribe();

        const ordersChannel = supabase
            .channel('orders_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
                loadOrders();
            })
            .subscribe();

        const expensesChannel = supabase
            .channel('expenses_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
                loadExpenses();
            })
            .subscribe();

        const notesChannel = supabase
            .channel('notes_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, () => {
                loadNotes();
            })
            .subscribe();

        return () => {
            eventsChannel.unsubscribe();
            itemsChannel.unsubscribe();
            ordersChannel.unsubscribe();
            expensesChannel.unsubscribe();
            notesChannel.unsubscribe();
        };
    }, [currentUser]);

    const initializeAuth = async () => {
        try {
            const user = await authService.getCurrentUserProfile();
            if (user && user.status === UserStatus.APPROVED) {
                setCurrentUser(user);
                await loadAllData();
            } else {
                // Keep unauthenticated state for pending users
                setCurrentUser(null);
            }
        } catch (err: any) {
            console.error('Auth initialization error:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadAllData = async () => {
        await Promise.all([
            loadUsers(),
            loadEvents(),
            loadItems(),
            loadOrders(),
            loadExpenses(),
            loadStoredFiles(),
            loadNotes(),
        ]);
    };

    const loadUsers = async () => {
        try {
            const data = await userService.getAllUsers();
            setUsers(data);
        } catch (err: any) {
            console.error('Error loading users:', err);
        }
    };

    const loadEvents = async () => {
        try {
            const data = await eventService.getAllEvents();
            setEvents(data);
        } catch (err: any) {
            console.error('Error loading events:', err);
        }
    };

    const loadItems = async () => {
        try {
            const data = await itemService.getAllItems();
            setItems(data);
        } catch (err: any) {
            console.error('Error loading items:', err);
        }
    };

    const loadOrders = async () => {
        try {
            const data = await orderService.getAllOrders();
            setOrders(data);
        } catch (err: any) {
            console.error('Error loading orders:', err);
        }
    };

    const loadExpenses = async () => {
        try {
            const data = await expenseService.getAllExpenses();
            setExpenses(data);
        } catch (err: any) {
            console.error('Error loading expenses:', err);
        }
    };

    const loadStoredFiles = async () => {
        try {
            const data = await fileService.getAllFiles();
            setStoredFiles(data);
        } catch (err: any) {
            console.error('Error loading files:', err);
        }
    };

    const loadNotes = async () => {
        try {
            const data = await noteService.getAllNotes();
            setNotes(data);
        } catch (err: any) {
            console.error('Error loading notes:', err);
        }
    };

    const clearAllData = () => {
        setUsers([]);
        setEvents([]);
        setItems([]);
        setOrders([]);
        setExpenses([]);
        setStoredFiles([]);
        setNotes([]);
    };

    const clearError = () => setError(null);
    const clearNotification = () => setNotification(null);

    const showNotification = (message: string, type: 'success' | 'error' = 'error') => {
        setNotification({ message, type });
    };

    const login = async (email: string, password: string) => {
        try {
            clearError();
            setLoading(true);
            await authService.signIn(email, password);
            const user = await authService.getCurrentUserProfile();
            
            if (user?.status === UserStatus.PENDING) {
                await authService.signOut();
                setError('Your account is pending approval from the host.');
                setLoading(false);
                return;
            }
            
            // Set user first, then load data
            setCurrentUser(user);
            await loadAllData();
            setLoading(false);
        } catch (err: any) {
            setError(err.message || 'Invalid email or password.');
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await authService.signOut();
            setCurrentUser(null);
            clearAllData();
        } catch (err: any) {
            showNotification(err.message || 'Error logging out', 'error');
        }
    };

    const requestToJoin = async (name: string, email: string, password: string) => {
        try {
            clearError();
            await authService.signUp(email, password, name);
            showNotification('Join request sent! Please wait for host approval.', 'success');
        } catch (err: any) {
            setError(err.message || 'Error sending join request.');
        }
    };

    const approveMember = async (memberId: string) => {
        try {
            await userService.approveMember(memberId);
            await loadUsers();
            showNotification('Member approved successfully!', 'success');
        } catch (err: any) {
            showNotification(err.message || 'Error approving member', 'error');
        }
    };

    const createEvent = async (name: string, year: number, imageUrl?: string) => {
        try {
            await eventService.createEvent(name, year, imageUrl);
            await loadEvents();
            showNotification('Event created successfully!', 'success');
        } catch (err: any) {
            showNotification(err.message || 'Error creating event', 'error');
        }
    };

    const addItem = async (eventId: string, name: string, initialStock: number) => {
        try {
            await itemService.createItem(eventId, name, initialStock);
            await loadItems();
            showNotification('Item added successfully!', 'success');
        } catch (err: any) {
            showNotification(err.message || 'Error adding item', 'error');
        }
    };

    const addStock = async (itemId: string, amount: number) => {
        try {
            await itemService.addStock(itemId, amount);
            await loadItems();
            showNotification('Stock added successfully!', 'success');
        } catch (err: any) {
            showNotification(err.message || 'Error adding stock', 'error');
        }
    };

    const editItemStock = async (itemId: string, newStock: number) => {
        try {
            await itemService.updateStock(itemId, newStock);
            await loadItems();
            showNotification('Stock updated successfully!', 'success');
        } catch (err: any) {
            showNotification(err.message || 'Error updating stock', 'error');
        }
    };

    const addOrder = async (memberId: string, eventId: string, itemId: string, customerName: string, quantityKg: number, amountInr: number) => {
        try {
            const item = items.find(i => i.id === itemId);
            if (!item) {
                showNotification("Selected item not found. Please refresh and try again.");
                return;
            }

            if (item.availableStockKg < quantityKg) {
                showNotification(`Insufficient stock for ${item.name}. Available: ${item.availableStockKg.toFixed(2)} kg.`);
                return;
            }

            await orderService.createOrder({
                memberId,
                eventId,
                itemId,
                customerName,
                quantityKg,
                amountInr,
            });
            await loadOrders();
            showNotification('Order created successfully!', 'success');
        } catch (err: any) {
            showNotification(err.message || 'Error creating order', 'error');
        }
    };

    const addConsumptionByHost = async (memberId: string, eventId: string, itemId: string, customerName: string, quantityKg: number, amountInr: number) => {
        try {
            const item = items.find(i => i.id === itemId);
            if (!item) {
                showNotification("Selected item not found. Please refresh and try again.");
                return;
            }

            if (item.availableStockKg < quantityKg) {
                showNotification(`Insufficient stock for ${item.name}. Available: ${item.availableStockKg.toFixed(2)} kg.`);
                return;
            }

            // Auto-verified order
            await orderService.createOrder({
                memberId,
                eventId,
                itemId,
                customerName,
                quantityKg,
                amountInr,
                verified: true,
            });

            // Reduce stock immediately
            await itemService.updateStock(itemId, item.availableStockKg - quantityKg);
            await loadOrders();
            await loadItems();
            showNotification('Consumption added successfully!', 'success');
        } catch (err: any) {
            showNotification(err.message || 'Error adding consumption', 'error');
        }
    };

    const editOrder = async (orderId: string, newValues: { customerName: string; itemId: string; quantityKg: number; amountInr: number; }) => {
        try {
            const item = items.find(i => i.id === newValues.itemId);
            if (!item) {
                showNotification("Selected item not found. Please refresh and try again.");
                return;
            }

            if (item.availableStockKg < newValues.quantityKg) {
                showNotification(`Insufficient stock for ${item.name}. Available: ${item.availableStockKg.toFixed(2)} kg.`);
                return;
            }

            await orderService.updateOrder(orderId, newValues);
            await loadOrders();
            showNotification('Order updated successfully!', 'success');
        } catch (err: any) {
            showNotification(err.message || 'Error updating order', 'error');
        }
    };

    const deleteOrder = async (orderId: string) => {
        try {
            await orderService.deleteOrder(orderId);
            await loadOrders();
            showNotification('Order deleted successfully!', 'success');
        } catch (err: any) {
            showNotification(err.message || 'Error deleting order', 'error');
        }
    };

    const verifyOrder = async (orderId: string) => {
        try {
            const order = orders.find(o => o.id === orderId);
            if (!order) {
                showNotification("Order not found.");
                return;
            }

            const item = items.find(i => i.id === order.itemId);
            if (!item) {
                showNotification("Item associated with this order not found.");
                return;
            }

            if (item.availableStockKg < order.quantityKg) {
                showNotification(`Cannot verify. Insufficient stock for ${item.name}. Available: ${item.availableStockKg.toFixed(2)} kg, Requested: ${order.quantityKg.toFixed(2)} kg.`);
                return;
            }

            await orderService.verifyOrder(orderId);
            // Reduce stock
            await itemService.updateStock(order.itemId, item.availableStockKg - order.quantityKg);
            await loadOrders();
            await loadItems();
            showNotification('Order verified successfully!', 'success');
        } catch (err: any) {
            showNotification(err.message || 'Error verifying order', 'error');
        }
    };

    const rejectOrder = async (orderId: string) => {
        try {
            await orderService.deleteOrder(orderId);
            await loadOrders();
            showNotification('Order rejected!', 'success');
        } catch (err: any) {
            showNotification(err.message || 'Error rejecting order', 'error');
        }
    };

    const updateOrderPaymentStatus = async (orderId: string, status: PaymentStatus) => {
        try {
            await orderService.updatePaymentStatus(orderId, status);
            await loadOrders();
            showNotification('Payment status updated!', 'success');
        } catch (err: any) {
            showNotification(err.message || 'Error updating payment status', 'error');
        }
    };

    const addExpense = async (addedById: string, eventId: string, name: string, amountInr: number) => {
        try {
            const isHost = currentUser?.role === Role.HOST;
            await expenseService.createExpense({
                addedById,
                eventId,
                name,
                amountInr,
                verified: isHost, // Host expenses are auto-verified
            });
            await loadExpenses();
            showNotification('Expense added successfully!', 'success');
        } catch (err: any) {
            showNotification(err.message || 'Error adding expense', 'error');
        }
    };

    const editExpense = async (expenseId: string, newName: string, newAmount: number) => {
        try {
            await expenseService.updateExpense(expenseId, newName, newAmount);
            await loadExpenses();
            showNotification('Expense updated successfully!', 'success');
        } catch (err: any) {
            showNotification(err.message || 'Error updating expense', 'error');
        }
    };

    const deleteExpense = async (expenseId: string) => {
        try {
            await expenseService.deleteExpense(expenseId);
            await loadExpenses();
            showNotification('Expense deleted successfully!', 'success');
        } catch (err: any) {
            showNotification(err.message || 'Error deleting expense', 'error');
        }
    };

    const verifyExpense = async (expenseId: string) => {
        try {
            await expenseService.verifyExpense(expenseId);
            await loadExpenses();
            showNotification('Expense verified successfully!', 'success');
        } catch (err: any) {
            showNotification(err.message || 'Error verifying expense', 'error');
        }
    };

    const uploadFile = async (file: File) => {
        try {
            if (!currentUser) {
                showNotification('You must be logged in to upload files.');
                return;
            }

            await fileService.uploadFile(currentUser.id, file);
            await loadStoredFiles();
            showNotification('File uploaded successfully!', 'success');
        } catch (err: any) {
            showNotification(err.message || 'Error uploading file', 'error');
        }
    };

    const deleteFile = async (fileId: string, filePath: string) => {
        try {
            await fileService.deleteFile(fileId, filePath);
            await loadStoredFiles();
            showNotification('File deleted successfully!', 'success');
        } catch (err: any) {
            showNotification(err.message || 'Error deleting file', 'error');
        }
    };

    const addNote = async (memberId: string, eventId: string, content: string, imageUrls?: string[]) => {
        try {
            await noteService.createNote({
                memberId,
                eventId,
                content,
                imageUrls,
            });
            await loadNotes();
            showNotification('Note added successfully!', 'success');
        } catch (err: any) {
            showNotification(err.message || 'Error adding note', 'error');
        }
    };

    const editNote = async (noteId: string, newContent: string, newImageUrls?: string[]) => {
        try {
            await noteService.updateNote(noteId, newContent, newImageUrls);
            await loadNotes();
            showNotification('Note updated successfully!', 'success');
        } catch (err: any) {
            showNotification(err.message || 'Error updating note', 'error');
        }
    };

    const deleteNote = async (noteId: string) => {
        try {
            await noteService.deleteNote(noteId);
            await loadNotes();
            showNotification('Note deleted successfully!', 'success');
        } catch (err: any) {
            showNotification(err.message || 'Error deleting note', 'error');
        }
    };

    const changePassword = async (newPass: string) => {
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPass,
            });

            if (error) throw error;
            showNotification('Password changed successfully!', 'success');
        } catch (err: any) {
            showNotification(err.message || 'Error changing password', 'error');
        }
    };

    const value: AppContextType = {
        currentUser,
        users,
        events,
        items,
        orders,
        expenses,
        storedFiles,
        notes,
        error,
        notification,
        loading,
        login,
        logout,
        requestToJoin,
        clearError,
        clearNotification,
        showNotification,
        approveMember,
        createEvent,
        addItem,
        addStock,
        editItemStock,
        addExpense,
        verifyExpense,
        editExpense,
        deleteExpense,
        uploadFile,
        deleteFile,
        verifyOrder,
        rejectOrder,
        addOrder,
        editOrder,
        deleteOrder,
        updateOrderPaymentStatus,
        addNote,
        editNote,
        deleteNote,
        changePassword,
        addConsumptionByHost,
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
