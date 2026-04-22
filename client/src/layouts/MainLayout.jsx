import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router";
import { fetchProfile } from "../features/auth/authSlice";

export default function MainLayout() {
  const dispatch = useDispatch();
  const { accessToken } = useSelector((s) => s.auth);

  useEffect(() => {
    if (accessToken) dispatch(fetchProfile());
  }, [accessToken, dispatch]);

  if (!accessToken) return <Navigate to="/login" />;
  return (
    <div>
      {/* <Navbar /> */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
