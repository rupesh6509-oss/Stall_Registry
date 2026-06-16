import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const StallContext = createContext();

const mapStallData = (dbStall) => {
  if (!dbStall) return null;
  return {
    id: dbStall.id,
    username: dbStall.username,
    stallName: dbStall.stall_name,
    instagramId: dbStall.instagram_id,
    whatsappLink: dbStall.whatsapp_link,
    contactName: dbStall.contact_name,
    contactMobile: dbStall.contact_mobile,
    logo: dbStall.logo,
    role: dbStall.role || 'stall'
  };
};

export const StallProvider = ({ children }) => {
  const [currentStall, setCurrentStall] = useState(null);
  const [visitors, setVisitors] = useState([]);
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  
  // Admin Consolidated States
  const [allStalls, setAllStalls] = useState([]);
  const [allVisitors, setAllVisitors] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [allInvoices, setAllInvoices] = useState([]);
  
  const [loading, setLoading] = useState(false);

  // Restore session from Supabase Auth on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          const { data: profile, error: profileErr } = await supabase
            .from('stalls')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileErr) throw profileErr;
          if (profile) {
            setCurrentStall(mapStallData(profile));
          } else {
            // Profile row missing, sign out to prevent broken state
            await supabase.auth.signOut();
            setCurrentStall(null);
          }
        }
      } catch (err) {
        console.error('Session check error:', err.message);
      }
    };
    checkSession();

    // Listen to auth state updates (e.g. sign in/out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const { data: profile } = await supabase
            .from('stalls')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          if (profile) {
            setCurrentStall(mapStallData(profile));
          }
        } catch (e) {
          console.error('Auth state profile fetch error:', e.message);
        }
      } else {
        setCurrentStall(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch data dynamically based on role (Stall vs Admin)
  useEffect(() => {
    if (!currentStall) {
      setVisitors([]);
      setProducts([]);
      setInvoices([]);
      setAllStalls([]);
      setAllVisitors([]);
      setAllProducts([]);
      setAllInvoices([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        if (currentStall.role === 'admin') {
          // ADMIN: Fetch everything across all stalls
          
          // 1. Fetch all stalls
          const { data: stallsData, error: stallsErr } = await supabase
            .from('stalls')
            .select('*')
            .order('stall_name', { ascending: true });
          if (stallsErr) throw stallsErr;
          setAllStalls(stallsData ? stallsData.map(mapStallData) : []);

          // 2. Fetch all visitors
          const { data: visitorsData, error: visitorsErr } = await supabase
            .from('visitors')
            .select('*')
            .order('date', { ascending: false });
          if (visitorsErr) throw visitorsErr;
          setAllVisitors(visitorsData || []);

          // 3. Fetch all products
          const { data: productsData, error: productsErr } = await supabase
            .from('products')
            .select('*');
          if (productsErr) throw productsErr;
          setAllProducts(productsData || []);

          // 4. Fetch all invoices
          const { data: invoicesData, error: invoicesErr } = await supabase
            .from('invoices')
            .select('*')
            .order('date', { ascending: false });
          if (invoicesErr) throw invoicesErr;
          setAllInvoices(invoicesData || []);

        } else {
          // STANDARD STALL: Fetch scoped data
          const stallId = currentStall.id;

          // 1. Fetch visitors
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

          // Seed default catalog if empty
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

          // 3. Fetch invoices
          const { data: invoicesData, error: invoicesErr } = await supabase
            .from('invoices')
            .select('*')
            .eq('stall_id', stallId)
            .order('date', { ascending: false });
          if (invoicesErr) throw invoicesErr;
          setInvoices(invoicesData || []);
        }
      } catch (err) {
        console.error('Data loading error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentStall]);

  // Auth Operations
  const login = async (username, password) => {
    const cleanUsername = username.trim().toLowerCase();
    const email = cleanUsername.includes('@') ? cleanUsername : `${cleanUsername}@stall.com`;
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data?.user) {
        const { data: profile, error: profileErr } = await supabase
          .from('stalls')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profileErr) throw profileErr;
        
        if (profile) {
          setCurrentStall(mapStallData(profile));
          return { success: true };
        } else {
          // If profile is missing, sign out auth session
          await supabase.auth.signOut();
          return { success: false, message: 'Stall profile not found. Please register again.' };
        }
      }
      return { success: false, message: 'Invalid credentials' };
    } catch (err) {
      console.error('Login error:', err.message);
      return { success: false, message: `Login failed: ${err.message}` };
    }
  };

  const registerStall = async (username, password, stallName) => {
    const cleanUsername = username.trim().toLowerCase();
    const email = cleanUsername.includes('@') ? cleanUsername : `${cleanUsername}@stall.com`;
    try {
      // 1. Sign up user in Supabase Auth
      const { data: authData, error: signUpErr } = await supabase.auth.signUp({
        email,
        password
      });

      if (signUpErr) throw signUpErr;

      if (authData?.user) {
        // 2. Insert profile record in stalls table
        const { data: profile, error: insertErr } = await supabase
          .from('stalls')
          .insert([{
            id: authData.user.id,
            username: cleanUsername,
            stall_name: stallName,
            instagram_id: '',
            whatsapp_link: '',
            contact_name: '',
            contact_mobile: '',
            logo: '',
            role: 'stall'
          }])
          .select()
          .single();

        if (insertErr) {
          // If profile insert fails, delete auth user if possible or return error
          throw insertErr;
        }

        setCurrentStall(mapStallData(profile));
        return { success: true };
      }
      return { success: false, message: 'Signup failed. Please try again.' };
    } catch (err) {
      console.error('Registration error:', err.message);
      return { success: false, message: `Registration failed: ${err.message}` };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentStall(null);
      localStorage.removeItem('ex_active_session');
    } catch (err) {
      console.error('Logout error:', err.message);
    }
  };

  // Settings Operations
  const updateSettings = async (settingsData) => {
    if (!currentStall) return { success: false, message: 'No active session' };

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
      
      // If admin, update the stalls list locally as well
      if (currentStall.role === 'admin') {
        setAllStalls(prev => prev.map(s => s.id === data.id ? mapStallData(data) : s));
      }
      return { success: true };
    } catch (err) {
      console.error('Settings update error:', err.message);
      return { success: false, message: `Database error: ${err.message}` };
    }
  };

  // Admin Stall Deletion
  const deleteStall = async (stallId) => {
    if (currentStall?.role !== 'admin') return { success: false, message: 'Unauthorized' };
    
    try {
      const { error } = await supabase
        .from('stalls')
        .delete()
        .eq('id', stallId);

      if (error) throw error;

      setAllStalls(prev => prev.filter(s => s.id !== stallId));
      // Re-trigger fetch to clean up visitors, products, invoices
      setAllVisitors(prev => prev.filter(v => v.stall_id !== stallId));
      setAllProducts(prev => prev.filter(p => p.stall_id !== stallId));
      setAllInvoices(prev => prev.filter(i => i.stall_id !== stallId));

      return { success: true };
    } catch (err) {
      console.error('Stall delete error:', err.message);
      return { success: false, message: err.message };
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
      console.error('Error adding visitor:', err.message);
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
      console.error('Error adding product:', err.message);
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
      console.error('Error updating product:', err.message);
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
      console.error('Error deleting product:', err.message);
    }
  };

  // Invoice Operations
  const addInvoice = async (invoiceData) => {
    if (!currentStall) return null;
    
    try {
      const listToCount = currentStall.role === 'admin' ? allInvoices : invoices;
      const invoiceNum = `INV-${new Date().getFullYear()}-${(listToCount.length + 1).toString().padStart(4, '0')}`;
      
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
      console.error('Error adding invoice:', err.message);
      return null;
    }
  };

  return (
    <StallContext.Provider value={{
      currentStall,
      visitors,
      products,
      invoices,
      
      // Admin states
      allStalls,
      allVisitors,
      allProducts,
      allInvoices,
      
      loading,
      login,
      registerStall,
      logout,
      updateSettings,
      deleteStall,
      
      // Stall actions
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
