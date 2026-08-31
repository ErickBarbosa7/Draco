function requerir(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) {
    throw new Error(
      `Falta la variable de entorno obligatoria "${nombre}". Configúrala antes de iniciar el servidor.`,
    );
  }
  return valor;
}

const esProduccion = process.env.NODE_ENV === 'production';

export const config = {
  esProduccion,
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: esProduccion ? requerir('JWT_SECRET') : (process.env.JWT_SECRET ?? 'draco-dev-secret'),
  frontendOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173,http://localhost:4000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  databaseUrl: requerir('DATABASE_URL'),
};
