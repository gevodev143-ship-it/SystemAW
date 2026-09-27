import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "../../shared/layouts/MainLayout";
import LoginLayout from "../../shared/layouts/LoginLayout";
import HomeLayout from "../../shared/layouts/HomeLayout";

import ProtectedRoute from "../../shared/components/ProtectedRoute";
import { AuthProvider } from "../../core/contexts/auth.context";

import LoginRoutes from "../../modules/login/routes/LoginRoutes";
import HomeRoutes from "../../modules/home/routes/HomeRoutes";
import StaffRoutes from "../../modules/staff/routes/StaffRoutes";
import JobpositionRoutes from "../../modules/jobposition/routes/JobpositionRoutes";
import AttendanceRoutes from "../../modules/attendance/routes/AttendanceRoutes";
import MapRoutes from "../../modules/map/routes/MapRoutes";
import ExtensionRoutes from "../../modules/extension/routes/ExtensionRoutes";
import Ejemplo_moduloRoutes from "../../modules/ejemplo_modulo/routes/Ejemplo_moduloRoutes";
import RoleRoutes from "../../modules/role/routes/RoleRoutes";
import Organizational_chartRoutes from "../../modules/organizational-chart/routes/Organizational-chartRoutes";
import FotocheckRoutes from "../../modules/fotocheck/routes/FotocheckRoutes";
import LogoRoutes from "../../modules/logo/routes/LogoRoutes";


export default function AppRoutes() {
    return (
        <BrowserRouter>
            <AuthProvider>
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
                        <Route element={<MainLayout />}>
                            {StaffRoutes}
                            {JobpositionRoutes}
                            {AttendanceRoutes}
                            {MapRoutes}
                            {ExtensionRoutes}
                            {Ejemplo_moduloRoutes}
                            {RoleRoutes}
                            {Organizational_chartRoutes}
                            {FotocheckRoutes}
                            {LogoRoutes}
                        </Route>
                    </Route>

                    <Route element={<MainLayout />}>
                        {RoleRoutes}
                    </Route>

                    <Route element={<MainLayout />}>
                        {Organizational_chartRoutes}
                    </Route>


                    {/* ==================== RUTA POR DEFECTO ==================== */}

                    <Route
                        path="*"
                        element={<Navigate to="/" replace />}
                    />

                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}