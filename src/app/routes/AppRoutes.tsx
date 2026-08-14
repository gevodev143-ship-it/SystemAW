import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginLayout from "../../shared/layouts/LoginLayout";
import HomeLayout from "../../shared/layouts/HomeLayout";
import UserLayout from "../../shared/layouts/UserLayout";
import CatalogLayout from "../../shared/layouts/CatalogLayout";
import CityLayout from "../../shared/layouts/CityLayout";
import IconLayout from "../../shared/layouts/IconLayout";
import AttendanceLayout from "../../shared/layouts/AttendanceLayout";

import LoginRoutes from "../../modules/login/routes/LoginRoutes";
import HomeRoutes from "../../modules/home/routes/HomeRoutes";
import UserRoutes from "../../modules/user/routes/UserRoutes";
import CatalogRoutes from "../../modules/catalog/routes/CatalogRoutes";
import CityRoutes from "../../modules/city/routes/CityRoutes";
import IconRoutes from "../../modules/icon/routes/IconRoutes";
import AttendanceRoutes from "../../modules/attendance/routes/AttendanceRoutes";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>

                <Route element={<HomeLayout />}>
                    {HomeRoutes}
                </Route>

                <Route element={<LoginLayout />}>
                    {LoginRoutes}
                </Route>

                <Route element={<UserLayout />}>
                    {UserRoutes}
                </Route>

                <Route element={<CatalogLayout />}>
                    {CatalogRoutes}
                </Route>

                <Route element={<CityLayout />}>
                    {CityRoutes}
                </Route>

           
                <Route element={<IconLayout />}>
                    {IconRoutes}
                </Route>

                <Route element={<AttendanceLayout />}>
                    {AttendanceRoutes}
                </Route>

                {/* tenemos la pagina por defecto */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}