import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginLayout from "../../shared/layouts/LoginLayout";
import HomeLayout from "../../shared/layouts/HomeLayout";
import UserLayout from "../../shared/layouts/UserLayout";
import AttendanceLayout from "../../shared/layouts/AttendanceLayout";
import StaffLayout from "../../shared/layouts/StaffLayout";

import ProtectedRoute from "../../shared/components/ProtectedRoute";

import LoginRoutes from "../../modules/login/routes/LoginRoutes";
import HomeRoutes from "../../modules/home/routes/HomeRoutes";
import UserRoutes from "../../modules/user/routes/UserRoutes";
import AttendanceRoutes from "../../modules/attendance/routes/AttendanceRoutes";
import StaffRoutes from "../../modules/staff/routes/StaffRoutes";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>

                {/* ==================== PÚBLICO ==================== */}
                <Route element={<HomeLayout />}>
                    {HomeRoutes}
                </Route>
                <Route element={<LoginLayout />}>
                    {LoginRoutes}
                </Route>


                {/* ==================== PROTEGIDO ==================== */}

                <Route element={<ProtectedRoute />}>



                    <Route element={<UserLayout />}>
                        {UserRoutes}
                    </Route>

                    <Route element={<StaffLayout />}>
                        {StaffRoutes}
                    </Route>





                    <Route element={<AttendanceLayout />}>
                        {AttendanceRoutes}
                    </Route>



                </Route>


                {/* ==================== RUTA POR DEFECTO ==================== */}

                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />

            </Routes>
        </BrowserRouter>
    );
}