import React from "react";

import { Navigate, Outlet } from "react-router-dom";

const ProviderPrivateComp = () => {
  const auth = localStorage.getItem("provider");
  return <>{auth ? <Outlet /> : <Navigate to="/provider/register" />}</>;
};

export default ProviderPrivateComp;
