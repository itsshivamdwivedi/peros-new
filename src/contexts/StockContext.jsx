"use client";

import { createContext, useContext, useState } from "react";

const StockContext = createContext();

export const StockProvider = ({ children }) => {
  // stockByProduct holds productId -> boolean (true = in stock, false = out of stock)
  const [stockByProduct, setStockByProduct] = useState({});

  // Toggle product stock status
  const setStock = (productId, isInStock) => {
    setStockByProduct((prev) => ({
      ...prev,
      [productId]: isInStock,
    }));
  };

  return (
    <StockContext.Provider value={{ stockByProduct, setStock }}>
      {children}
    </StockContext.Provider>
  );
};

export const useStock = () => useContext(StockContext);
