#!/usr/bin/env node

import { Command } from "commander";
import fs from "node:fs";
import path from "node:path";

const program = new Command();

program
  .name("saw")
  .description("CLI oficial para System AW")
  .version("1.0.0");

const create = program
  .command("create")
  .description("Crear recursos de System AW");

create
  .command("module <name>")
  .description("Crear un módulo (carpeta, layout y registro de rutas)")
  .action((name: string) => {
    // =========================================================
    // NOMBRES
    // =========================================================

    const moduleName = name.toLowerCase();

    if (!/^[a-z0-9_-]+$/.test(moduleName)) {
      console.error(
        `❌ Nombre inválido: "${name}". Usa solo letras, números, "_" o "-".`
      );
      process.exit(1);
    }

    const Module = capitalize(moduleName);

    // =========================================================
    // RUTAS DEL PROYECTO
    // =========================================================

    const projectPath = findProjectRoot(process.cwd());
    const srcPath = path.join(projectPath, "src");

    if (!fs.existsSync(srcPath)) {
      console.error(`❌ No se encontró la carpeta "src" en: ${projectPath}`);
      console.error("   Ejecuta el comando dentro de tu proyecto.");
      process.exit(1);
    }

    const modulePath = path.join(srcPath, "modules", moduleName);
    const layoutsPath = path.join(srcPath, "shared", "layouts");
    const layoutFile = path.join(layoutsPath, `${Module}Layout.tsx`);
    const appRoutesFile = path.join(srcPath, "app", "routes", "AppRoutes.tsx");

    if (fs.existsSync(modulePath)) {
      console.error(`❌ El módulo "${moduleName}" ya existe.`);
      console.error(`   ${modulePath}`);
      process.exit(1);
    }

    // =========================================================
    // CREAR CARPETAS
    // =========================================================

    const componentsPath = path.join(modulePath, "components", "seccion_1");
    const controllersPath = path.join(modulePath, "controllers");
    const pagesPath = path.join(modulePath, "pages");
    const routesPath = path.join(modulePath, "routes");
    const servicesPath = path.join(modulePath, "services");

    fs.mkdirSync(componentsPath, { recursive: true });
    fs.mkdirSync(controllersPath, { recursive: true });
    fs.mkdirSync(pagesPath, { recursive: true });
    fs.mkdirSync(routesPath, { recursive: true });
    fs.mkdirSync(servicesPath, { recursive: true });
    fs.mkdirSync(layoutsPath, { recursive: true });

    // =========================================================
    // ARCHIVOS DEL MÓDULO
    // =========================================================

    // components/seccion_1/seccion_1.tsx
    fs.writeFileSync(
      path.join(componentsPath, "seccion_1.tsx"),
      `import style from "./seccion_1.module.css";

const Seccion_1 = () => {
  return (
    <div className={style.seccion}>
      <p>hola</p>
    </div>
  );
};

export default Seccion_1;
`,
      "utf-8"
    );

    // components/seccion_1/seccion_1.module.css
    fs.writeFileSync(
      path.join(componentsPath, "seccion_1.module.css"),
      `.seccion {
}
`,
      "utf-8"
    );

    // pages/<Module>Page.tsx
    fs.writeFileSync(
      path.join(pagesPath, `${Module}Page.tsx`),
      `import Seccion_1 from "../components/seccion_1/seccion_1";

export default function ${Module}Page() {
  return (
    <div>
      <Seccion_1 />
    </div>
  );
}
`,
      "utf-8"
    );

    // pages/<Module>Page.module.css
    fs.writeFileSync(
      path.join(pagesPath, `${Module}Page.module.css`),
      `.page {
}
`,
      "utf-8"
    );

    // routes/<Module>Routes.tsx
    fs.writeFileSync(
      path.join(routesPath, `${Module}Routes.tsx`),
      `import { Route } from "react-router-dom";
import ${Module}Page from "../pages/${Module}Page";

export default [
  <Route key="${moduleName}" path="/${moduleName}" element={<${Module}Page />} />,
];
`,
      "utf-8"
    );

    // =========================================================
    // LAYOUT: src/shared/layouts/<Module>Layout.tsx
    // =========================================================

    let layoutCreated = false;

    if (fs.existsSync(layoutFile)) {
      console.warn(`⚠️  Ya existe ${Module}Layout.tsx, no se modificó.`);
    } else {
      fs.writeFileSync(
        layoutFile,
        `import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar/sidebar";
import BarraSuperior from "../components/layout/BarraSuperior/BarraSuperior";

export default function ${Module}Layout() {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: "auto" }}>
        <BarraSuperior />
        <Outlet />
      </main>
    </div>
  );
}
`,
        "utf-8"
      );
      layoutCreated = true;
    }

    // =========================================================
    // REGISTRAR EN src/app/routes/AppRoutes.tsx (solo añade)
    // =========================================================

    const importsSnippet = [
      `import ${Module}Layout from "../../shared/layouts/${Module}Layout";`,
      `import ${Module}Routes from "../../modules/${moduleName}/routes/${Module}Routes";`,
    ];

    const routeSnippet = [
      `<Route element={<${Module}Layout />}>`,
      `    {${Module}Routes}`,
      `</Route>`,
    ];

    const registered = registerInAppRoutes(
      appRoutesFile,
      Module,
      importsSnippet,
      routeSnippet
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
    console.log(`   │   ├── ${Module}Page.tsx`);
    console.log(`   │   └── ${Module}Page.module.css`);
    console.log("   ├── routes/");
    console.log(`   │   └── ${Module}Routes.tsx`);
    console.log("   └── services/");
    console.log("");
    console.log(`📍 ${modulePath}`);

    if (layoutCreated) {
      console.log(`🧩 Layout: ${layoutFile}`);
    }

    if (registered === "ok") {
      console.log(`🔗 Rutas registradas en: ${appRoutesFile}`);
    } else if (registered === "already") {
      console.log(`ℹ️  El módulo ya estaba registrado en AppRoutes.tsx`);
    } else {
      console.log("");
      console.log("⚠️  No se pudo editar AppRoutes.tsx. Añade esto a mano:");
      console.log("");
      importsSnippet.forEach((l) => console.log(`   ${l}`));
      console.log("");
      routeSnippet.forEach((l) => console.log(`   ${l}`));
    }

    console.log("");
  });

// =========================================================
// HELPERS
// =========================================================

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Busca la raíz del proyecto subiendo desde el directorio actual
 * hasta encontrar un package.json junto a una carpeta src.
 */
function findProjectRoot(start: string): string {
  let dir = path.resolve(start);

  for (;;) {
    const hasPackage = fs.existsSync(path.join(dir, "package.json"));
    const hasSrc = fs.existsSync(path.join(dir, "src"));

    if (hasPackage && hasSrc) return dir;

    const parent = path.dirname(dir);
    if (parent === dir) return path.resolve(start);
    dir = parent;
  }
}

/**
 * Añade (nunca reemplaza) los imports y el bloque <Route> en AppRoutes.tsx.
 * - Los imports se insertan después del último import del archivo.
 * - El bloque <Route> se inserta justo antes del último </Routes>.
 */
function registerInAppRoutes(
  filePath: string,
  Module: string,
  imports: string[],
  route: string[]
): "ok" | "already" | "fail" {
  if (!fs.existsSync(filePath)) return "fail";

  const original = fs.readFileSync(filePath, "utf-8");

  // Ya registrado -> no tocar nada
  if (original.includes(`${Module}Layout`) || original.includes(`${Module}Routes`)) {
    return "already";
  }

  const eol = original.includes("\r\n") ? "\r\n" : "\n";
  const lines = original.split(/\r?\n/);

  // Último </Routes>
  let closeIdx = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].includes("</Routes>")) {
      closeIdx = i;
      break;
    }
  }

  // Último import
  let importIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*import\s.+from\s+["'].+["'];?\s*$/.test(lines[i])) importIdx = i;
  }

  if (closeIdx === -1 || importIdx === -1) return "fail";

  const closeIndent = lines[closeIdx].match(/^\s*/)?.[0] ?? "";
  const innerIndent = closeIndent + "    ";

  // Primero el bloque de rutas (índice mayor), luego los imports
  lines.splice(closeIdx, 0, ...route.map((l) => innerIndent + l));
  lines.splice(importIdx + 1, 0, ...imports);

  fs.writeFileSync(filePath, lines.join(eol), "utf-8");
  return "ok";
}

program.parse();