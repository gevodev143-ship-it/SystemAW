import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginLayout from "../../shared/layouts/LoginLayout";
import HomeLayout from "../../shared/layouts/HomeLayout";
import StaffLayout from "../../shared/layouts/StaffLayout";
import AttendanceLayout from "../../shared/layouts/AttendanceLayout";
import MapLayout from "../../shared/layouts/MapLayout";
import ExtensionLayout from "../../shared/layouts/ExtensionLayout";

import ProtectedRoute from "../../shared/components/ProtectedRoute";

import LoginRoutes from "../../modules/login/routes/LoginRoutes";
import HomeRoutes from "../../modules/home/routes/HomeRoutes";
import StaffRoutes from "../../modules/staff/routes/StaffRoutes";
import AttendanceRoutes from "../../modules/attendance/routes/AttendanceRoutes";
import MapRoutes from "../../modules/map/routes/MapRoutes";
import ExtensionRoutes from "../../modules/extension/routes/ExtensionRoutes";

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

                    <Route element={<StaffLayout />}>
                        {StaffRoutes}
                    </Route>

                    <Route element={<AttendanceLayout />}>
                        {AttendanceRoutes}
                    </Route>
        
                    <Route element={<MapLayout />}>
                        {MapRoutes}
                    </Route>
                            
                    <Route element={<ExtensionLayout />}>
                        {ExtensionRoutes}
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