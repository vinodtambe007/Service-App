import React, { createContext, useState, useContext, useEffect } from "react";

const StateContext = createContext();

export const StateProvider = ({ children }) => {
  const [cart, setCart] = React.useState([]);

  return (
    <StateContext.Provider value={{ cart, setCart }}>
      {children}
    </StateContext.Provider>
  );
};

// Custom hook for using the context
export const useStateContext = () => useContext(StateContext);
