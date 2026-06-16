import React, { createContext, useState, useEffect } from 'react';

export const StallContext = createContext();

export const StallProvider = ({ children }) => {
  const [stalls, setStalls] = useState([]);
  const [currentStall, setCurrentStall] = useState(null);
  const [visitors, setVisitors] = useState([]);
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);

  // Initialize and load stalls list from localStorage
  useEffect(() => {
    const savedStalls = localStorage.getItem('ex_stalls');
    let stallsList = [];
    if (savedStalls) {
      stallsList = JSON.parse(savedStalls);
    } else {
      // Create a default demo stall for easy testing
      stallsList = [
        {
          username: 'demo',
          password: 'password',
          stallName: 'Jain Creations',
          instagramId: 'jain_creations_official',
          whatsappLink: 'https://chat.whatsapp.com/demo_group_link',
          contactName: 'Devendra Jain',
          contactMobile: '+919876543210',
          logo: '' // base64 logo string
        }
      ];
      localStorage.setItem('ex_stalls', JSON.stringify(stallsList));
    }
    setStalls(stallsList);

    // Auto-login demo or check active session
    const activeSession = localStorage.getItem('ex_active_session');
    if (activeSession) {
      const activeStall = stallsList.find(s => s.username === activeSession);
      if (activeStall) {
        setCurrentStall(activeStall);
      }
    }
  }, []);

  // Load stall-specific data whenever currentStall changes
  useEffect(() => {
    if (currentStall) {
      const username = currentStall.username;
      
      // Load visitors
      const savedVisitors = localStorage.getItem(`ex_visitors_${username}`);
      setVisitors(savedVisitors ? JSON.parse(savedVisitors) : []);

      // Load products (if empty, add some demo products)
      const savedProducts = localStorage.getItem(`ex_products_${username}`);
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      } else {
        const defaultProducts = [
          { id: '1', name: 'Cotton Designer Kurti', rate: 799, qty: 1 },
          { id: '2', name: 'Silk Palazzo Set', rate: 1499, qty: 1 },
          { id: '3', name: 'Ethnic Embroidered Dupatta', rate: 350, qty: 1 },
          { id: '4', name: 'Georgette Anarkali Gown', rate: 2499, qty: 1 }
        ];
        localStorage.setItem(`ex_products_${username}`, JSON.stringify(defaultProducts));
        setProducts(defaultProducts);
      }

      // Load invoices
      const savedInvoices = localStorage.getItem(`ex_invoices_${username}`);
      setInvoices(savedInvoices ? JSON.parse(savedInvoices) : []);
    } else {
      setVisitors([]);
      setProducts([]);
      setInvoices([]);
    }
  }, [currentStall]);

  // Auth Operations
  const login = (username, password) => {
    const stall = stalls.find(s => s.username.toLowerCase() === username.toLowerCase() && s.password === password);
    if (stall) {
      setCurrentStall(stall);
      localStorage.setItem('ex_active_session', stall.username);
      return { success: true };
    }
    return { success: false, message: 'Invalid username or password' };
  };

  const registerStall = (username, password, stallName) => {
    if (stalls.some(s => s.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, message: 'Username already exists' };
    }
    const newStall = {
      username,
      password,
      stallName,
      instagramId: '',
      whatsappLink: '',
      contactName: '',
      contactMobile: '',
      logo: ''
    };
    const updatedStalls = [...stalls, newStall];
    setStalls(updatedStalls);
    localStorage.setItem('ex_stalls', JSON.stringify(updatedStalls));
    
    // Auto-login the newly created stall
    setCurrentStall(newStall);
    localStorage.setItem('ex_active_session', username);
    return { success: true };
  };

  const logout = () => {
    setCurrentStall(null);
    localStorage.removeItem('ex_active_session');
  };

  // Settings Operations
  const updateSettings = (settingsData) => {
    if (!currentStall) return { success: false, message: 'No stall active' };

    const updatedStalls = stalls.map(s => {
      if (s.username === currentStall.username) {
        return { ...s, ...settingsData };
      }
      return s;
    });

    setStalls(updatedStalls);
    localStorage.setItem('ex_stalls', JSON.stringify(updatedStalls));
    setCurrentStall(prev => ({ ...prev, ...settingsData }));
    return { success: true };
  };

  // Visitor Operations
  const addVisitor = (visitorData) => {
    if (!currentStall) return;
    const username = currentStall.username;
    const newVisitor = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ...visitorData
    };
    const updatedVisitors = [newVisitor, ...visitors];
    setVisitors(updatedVisitors);
    localStorage.setItem(`ex_visitors_${username}`, JSON.stringify(updatedVisitors));
  };

  // Product Operations
  const addProduct = (productData) => {
    if (!currentStall) return;
    const username = currentStall.username;
    const newProduct = {
      id: Date.now().toString(),
      ...productData
    };
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    localStorage.setItem(`ex_products_${username}`, JSON.stringify(updatedProducts));
  };

  const updateProduct = (id, productData) => {
    if (!currentStall) return;
    const username = currentStall.username;
    const updatedProducts = products.map(p => p.id === id ? { ...p, ...productData } : p);
    setProducts(updatedProducts);
    localStorage.setItem(`ex_products_${username}`, JSON.stringify(updatedProducts));
  };

  const deleteProduct = (id) => {
    if (!currentStall) return;
    const username = currentStall.username;
    const updatedProducts = products.filter(p => p.id !== id);
    setProducts(updatedProducts);
    localStorage.setItem(`ex_products_${username}`, JSON.stringify(updatedProducts));
  };

  // Invoice Operations
  const addInvoice = (invoiceData) => {
    if (!currentStall) return;
    const username = currentStall.username;
    
    // Generate simple incremental Invoice ID based on current history length
    const invoiceNum = `INV-${new Date().getFullYear()}-${(invoices.length + 1).toString().padStart(4, '0')}`;
    
    const newInvoice = {
      id: Date.now().toString(),
      invoiceNumber: invoiceNum,
      date: new Date().toISOString(),
      customerName: 'Stall Customers', // Fixed name per requirements
      ...invoiceData
    };
    const updatedInvoices = [newInvoice, ...invoices];
    setInvoices(updatedInvoices);
    localStorage.setItem(`ex_invoices_${username}`, JSON.stringify(updatedInvoices));
    return newInvoice;
  };

  return (
    <StallContext.Provider value={{
      stalls,
      currentStall,
      visitors,
      products,
      invoices,
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
