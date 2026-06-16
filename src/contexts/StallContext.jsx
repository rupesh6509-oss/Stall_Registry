import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const StallContext = createContext();

// Mapper helper to translate PostgreSQL snake_case to JavaScript camelCase
const mapStallData = (dbStall) => {
  if (!dbStall) return null;
  return {
    id: dbStall.id,
    username: dbStall.username,
    password: dbStall.password,
    stallName: dbStall.stall_name,
    instagramId: dbStall.instagram_id,
    whatsappLink: dbStall.whatsapp_link,
    contactName: dbStall.contact_name,
    contactMobile: dbStall.contact_mobile,
    logo: dbStall.logo
  };
};

export const StallProvider = ({ children }) => {
  const [currentStall, setCurrentStall] = useState(null);
  const [visitors, setVisitors] = useState([]);
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  // Check active session on mount
  useEffect(() => {
    const checkActiveSession = async () => {
      const activeSession = localStorage.getItem('ex_active_session');
      if (activeSession) {
        try {
          const { data, error } = await supabase
            .from('stalls')
            .select('*')
            .eq('username', activeSession)
            .maybeSingle();

          if (error) throw error;
          if (data) {
            setCurrentStall(mapStallData(data));
          } else {
            localStorage.removeItem('ex_active_session');
          }
        } catch (err) {
          console.error('Error fetching active session from Supabase:', err.message);
        }
      }
    };
    checkActiveSession();
  }, []);

  // Fetch stall-specific data in real-time when currentStall changes
  useEffect(() => {
    if (!currentStall) {
      setVisitors([]);
      setProducts([]);
      setInvoices([]);
      return;
    }

    const fetchStallData = async () => {
      setLoading(true);
      const stallId = currentStall.id;

      try {
        // 1. Fetch visitors (order by date desc)
        const { data: visitorsData, error: visitorsErr } = await supabase
          .from('visitors')
          .select('*')
          .eq('stall_id', stallId)
          .order('date', { ascending: false });

        if (visitorsErr) throw visitorsErr;
        setVisitors(visitorsData || []);

        // 2. Fetch products
        const { data: productsData, error: productsErr } = await supabase
          .from('products')
          .select('*')
          .eq('stall_id', stallId);

        if (productsErr) throw productsErr;
        
        // If product catalog is completely empty, insert demo products for them
        if (!productsData || productsData.length === 0) {
          const defaultProducts = [
            { stall_id: stallId, name: 'Cotton Designer Kurti', rate: 799, qty: 1 },
            { stall_id: stallId, name: 'Silk Palazzo Set', rate: 1499, qty: 1 },
            { stall_id: stallId, name: 'Ethnic Embroidered Dupatta', rate: 350, qty: 1 }
          ];
          const { data: inserted, error: insertErr } = await supabase
            .from('products')
            .insert(defaultProducts)
            .select();
          if (!insertErr && inserted) {
            setProducts(inserted);
          }
        } else {
          setProducts(productsData);
        }

        // 3. Fetch invoices (order by date desc)
        const { data: invoicesData, error: invoicesErr } = await supabase
          .from('invoices')
          .select('*')
          .eq('stall_id', stallId)
          .order('date', { ascending: false });

        if (invoicesErr) throw invoicesErr;
        setInvoices(invoicesData || []);

      } catch (err) {
        console.error('Error fetching data from Supabase:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStallData();
  }, [currentStall]);

  // Auth Operations
  const login = async (username, password) => {
    try {
      const { data, error } = await supabase
        .from('stalls')
        .select('*')
        .eq('username', username.trim().toLowerCase())
        .eq('password', password)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setCurrentStall(mapStallData(data));
        localStorage.setItem('ex_active_session', data.username);
        return { success: true };
      }
      return { success: false, message: 'Invalid username or password' };
    } catch (err) {
      console.error('Login error:', err.message);
      return { success: false, message: `Database error: ${err.message}` };
    }
  };

  const registerStall = async (username, password, stallName) => {
    const cleanUsername = username.trim().toLowerCase();
    try {
      // Check if username exists
      const { data: existing, error: checkErr } = await supabase
        .from('stalls')
        .select('username')
        .eq('username', cleanUsername)
        .maybeSingle();

      if (checkErr) throw checkErr;
      if (existing) {
        return { success: false, message: 'Username already exists' };
      }

      // Insert new stall
      const { data: inserted, error: insertErr } = await supabase
        .from('stalls')
        .insert([{
          username: cleanUsername,
          password,
          stall_name: stallName,
          instagram_id: '',
          whatsapp_link: '',
          contact_name: '',
          contact_mobile: '',
          logo: ''
        }])
        .select()
        .single();

      if (insertErr) throw insertErr;

      setCurrentStall(mapStallData(inserted));
      localStorage.setItem('ex_active_session', inserted.username);
      return { success: true };
    } catch (err) {
      console.error('Registration error:', err.message);
      return { success: false, message: `Database error: ${err.message}` };
    }
  };

  const logout = () => {
    setCurrentStall(null);
    localStorage.removeItem('ex_active_session');
  };

  // Settings Operations
  const updateSettings = async (settingsData) => {
    if (!currentStall) return { success: false, message: 'No stall active' };

    try {
      const dbPayload = {
        stall_name: settingsData.stallName,
        instagram_id: settingsData.instagramId,
        whatsapp_link: settingsData.whatsappLink,
        contact_name: settingsData.contactName,
        contact_mobile: settingsData.contactMobile,
        logo: settingsData.logo
      };

      const { data, error } = await supabase
        .from('stalls')
        .update(dbPayload)
        .eq('id', currentStall.id)
        .select()
        .single();

      if (error) throw error;

      setCurrentStall(mapStallData(data));
      return { success: true };
    } catch (err) {
      console.error('Settings update error:', err.message);
      return { success: false, message: `Database error: ${err.message}` };
    }
  };

  // Visitor Operations
  const addVisitor = async (visitorData) => {
    if (!currentStall) return;
    try {
      const { data, error } = await supabase
        .from('visitors')
        .insert([{
          stall_id: currentStall.id,
          name: visitorData.name,
          mobile: visitorData.mobile
        }])
        .select()
        .single();

      if (error) throw error;
      setVisitors(prev => [data, ...prev]);
    } catch (err) {
      console.error('Error adding visitor to Supabase:', err.message);
    }
  };

  // Product Operations
  const addProduct = async (productData) => {
    if (!currentStall) return;
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          stall_id: currentStall.id,
          name: productData.name,
          rate: productData.rate,
          qty: productData.qty
        }])
        .select()
        .single();

      if (error) throw error;
      setProducts(prev => [...prev, data]);
    } catch (err) {
      console.error('Error adding product to Supabase:', err.message);
    }
  };

  const updateProduct = async (id, productData) => {
    if (!currentStall) return;
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          name: productData.name,
          rate: productData.rate,
          qty: productData.qty
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setProducts(prev => prev.map(p => p.id === id ? data : p));
    } catch (err) {
      console.error('Error updating product in Supabase:', err.message);
    }
  };

  const deleteProduct = async (id) => {
    if (!currentStall) return;
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting product from Supabase:', err.message);
    }
  };

  // Invoice Operations
  const addInvoice = async (invoiceData) => {
    if (!currentStall) return null;
    
    try {
      const invoiceNum = `INV-${new Date().getFullYear()}-${(invoices.length + 1).toString().padStart(4, '0')}`;
      
      const { data, error } = await supabase
        .from('invoices')
        .insert([{
          stall_id: currentStall.id,
          invoice_number: invoiceNum,
          customer_name: 'Stall Customers',
          customer_mobile: invoiceData.customerMobile,
          total: invoiceData.total,
          items: invoiceData.items
        }])
        .select()
        .single();

      if (error) throw error;
      
      setInvoices(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error adding invoice to Supabase:', err.message);
      return null;
    }
  };

  return (
    <StallContext.Provider value={{
      currentStall,
      visitors,
      products,
      invoices,
      loading,
      login,
      registerStall,
      logout,
      updateSettings,
      addVisitor,
      addProduct,
      updateProduct,
      deleteProduct,
      addInvoice
    }}>
      {children}
    </StallContext.Provider>
  );
};
