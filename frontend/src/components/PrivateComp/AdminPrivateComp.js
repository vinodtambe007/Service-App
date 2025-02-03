import React from "react";

import { Navigate, Outlet } from "react-router-dom";

const AdminPrivateComp = () => {
  const auth = localStorage.getItem("admin");
  return <>{auth ? <Outlet /> : <Navigate to="/admin/register" />}</>;
};

export default AdminPrivateComp;
