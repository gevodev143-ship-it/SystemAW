#!/usr/bin/env node

import { Command } from "commander";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const program = new Command();

// Obtener la ubicación real de este archivo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

program
  .name("saw")
  .description("CLI oficial para System AW")
  .version("1.0.0");

program
  .command("create")
  .description("Crear recursos de System AW")
  .command("module <name>")
  .description("Crear un módulo")
  .action((name: string) => {
    // Nombre del módulo en minúsculas
    const moduleName = name.toLowerCase();

    // Primera letra en mayúscula
    const moduleNameCapitalized = capitalize(moduleName);

    // proyecto/
    const projectPath = path.resolve(__dirname, "..", "..");

    // proyecto/src/modules/nombre-del-modulo
    const modulePath = path.resolve(
      projectPath,
      "src",
      "modules",
      moduleName
    );

    // Verificar si el módulo ya existe
    if (fs.existsSync(modulePath)) {
      console.error(`❌ El módulo "${moduleName}" ya existe.`);
      process.exit(1);
    }

    // =========================================================
    // CREAR CARPETAS
    // =========================================================

    const componentsPath = path.join(
      modulePath,
      "components",
      "seccion_1"
    );

    const controllersPath = path.join(
      modulePath,
      "controllers"
    );

    const pagesPath = path.join(
      modulePath,
      "pages"
    );

    const routesPath = path.join(
      modulePath,
      "routes"
    );

    const servicesPath = path.join(
      modulePath,
      "services"
    );

    // Crear las carpetas
    fs.mkdirSync(componentsPath, { recursive: true });
    fs.mkdirSync(controllersPath, { recursive: true });
    fs.mkdirSync(pagesPath, { recursive: true });
    fs.mkdirSync(routesPath, { recursive: true });
    fs.mkdirSync(servicesPath, { recursive: true });

    // =========================================================
    // CREAR ARCHIVOS
    // =========================================================

    // components/seccion_1/
    const componentTsx = path.join(
      componentsPath,
      "seccion_1.tsx"
    );

    const componentCss = path.join(
      componentsPath,
      "seccion_1.module.css"
    );

    // pages/
    const pageTsx = path.join(
      pagesPath,
      `${moduleNameCapitalized}Page.tsx`
    );

    const pageCss = path.join(
      pagesPath,
      `${moduleNameCapitalized}Page.module.css`
    );

    // routes/
    const routeTsx = path.join(
      routesPath,
      `${moduleNameCapitalized}Routes.tsx`
    );

    // =========================================================
    // CONTENIDO DE LOS ARCHIVOS
    // =========================================================

    fs.writeFileSync(
      componentTsx,
      `export default function Seccion_1() {
  return (
    <section>
      <h2>Sección 1</h2>
    </section>
  );
}
`,
      "utf-8"
    );

    fs.writeFileSync(
      componentCss,
      "",
      "utf-8"
    );

    fs.writeFileSync(
      pageTsx,
      `import styles from "./${moduleNameCapitalized}Page.module.css";

export default function ${moduleNameCapitalized}Page() {
  return (
    <main className={styles.page}>
      <h1>${moduleNameCapitalized}</h1>
    </main>
  );
}
`,
      "utf-8"
    );

    fs.writeFileSync(
      pageCss,
      `.page {
}
`,
      "utf-8"
    );

    fs.writeFileSync(
      routeTsx,
      `import { Routes, Route } from "react-router-dom";
import ${moduleNameCapitalized}Page from "../pages/${moduleNameCapitalized}Page";

export default function ${moduleNameCapitalized}Routes() {
  return (
    <Routes>
      <Route path="/${moduleName}" element={<${moduleNameCapitalized}Page />} />
    </Routes>
  );
}
`,
      "utf-8"
    );

    // =========================================================
    // RESULTADO
    // =========================================================

    console.log("");
    console.log(`✅ Módulo "${moduleName}" creado correctamente.`);
    console.log("");
    console.log("📁 Estructura creada:");
    console.log(`   ${moduleName}/`);
    console.log("   ├── components/");
    console.log("   │   └── seccion_1/");
    console.log("   │       ├── seccion_1.tsx");
    console.log("   │       └── seccion_1.module.css");
    console.log("   ├── controllers/");
    console.log("   ├── pages/");
    console.log(`   │   ├── ${moduleNameCapitalized}Page.tsx`);
    console.log(`   │   └── ${moduleNameCapitalized}Page.module.css`);
    console.log("   ├── routes/");
    console.log(`   │   └── ${moduleNameCapitalized}Routes.tsx`);
    console.log("   └── services/");
    console.log("");
    console.log(`📍 ${modulePath}`);
    console.log("");
  });

// =========================================================
// FUNCIÓN: Primera letra en mayúscula
// =========================================================

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

program.parse();