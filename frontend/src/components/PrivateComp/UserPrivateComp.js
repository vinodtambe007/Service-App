import React from "react";

import { Navigate, Outlet } from "react-router-dom";

const UserPrivateComp = () => {
  const auth = localStorage.getItem("user");
  return <>{auth ? <Outlet /> : <Navigate to="/user/register" />}</>;
};

export default UserPrivateComp;
