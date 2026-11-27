import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

const root = process.cwd();
const envPath = path.join(root, ".env");
const standalonePath = path.join(root, ".next", "standalone");

if (!fs.existsSync(envPath)) {
  throw new Error("Missing required root .env file.");
}

const env = dotenv.parse(fs.readFileSync(envPath));
if (!env.DATABASE_URL?.trim()) {
  throw new Error("The root .env file must define DATABASE_URL.");
}
if (!env.SESSION_SECRET || env.SESSION_SECRET.length < 32) {
  throw new Error("The root .env file must define SESSION_SECRET with at least 32 characters.");
}

for (const requiredPath of [
  path.join(standalonePath, "server.js"),
  path.join(standalonePath, "package.json"),
  path.join(standalonePath, "node_modules", "@prisma", "client"),
  path.join(standalonePath, "node_modules", "@prisma", "adapter-pg"),
  path.join(standalonePath, "node_modules", ".prisma", "client", "index.js"),
  path.join(standalonePath, "node_modules", "pg"),
  path.join(standalonePath, "node_modules", "sharp"),
  path.join(root, ".next", "static"),
]) {
  if (!fs.existsSync(requiredPath)) {
    throw new Error(`Missing build output: ${path.relative(root, requiredPath)}`);
  }
}

fs.cpSync(path.join(root, ".next", "static"), path.join(standalonePath, ".next", "static"), {
  recursive: true,
});
if (fs.existsSync(path.join(root, "public"))) {
  fs.cpSync(path.join(root, "public"), path.join(standalonePath, "public"), {
    recursive: true,
  });
}
fs.copyFileSync(envPath, path.join(standalonePath, ".env"));

const packagePath = path.join(standalonePath, "package.json");
const standalonePackage = JSON.parse(fs.readFileSync(packagePath, "utf8"));
standalonePackage.scripts = {
  ...standalonePackage.scripts,
  start: "node server.js",
};
fs.writeFileSync(packagePath, `${JSON.stringify(standalonePackage, null, 2)}\n`);
