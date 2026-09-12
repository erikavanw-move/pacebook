import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = ["PORT", "NODE_ENV"];

function validateEnv() {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      `❌ Faltan variables de entorno requeridas: ${missing.join(", ")}.\n` +
        `Creá un archivo .env en la raíz del proyecto (podés basarte en .env.example) y volvé a intentar.`
    );
    process.exit(1);
  }
}

validateEnv();

export const env = {
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
};
