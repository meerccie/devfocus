import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const isProd = process.env.NODE_ENV === 'production';

  // ✅ CORS CONFIG (safe for Render + Vercel)
  app.enableCors({
    origin: isProd
      ? [
          /\.vercel\.app$/, // all Vercel preview + production deployments
        ]
      : [
          'http://localhost:5173', // Vite dev server
        ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // ✅ Render requires dynamic port + 0.0.0.0 binding
  const port = process.env.PORT || 3000;

  await app.listen(port, '0.0.0.0');

  // ✅ Clean production-safe logging
  console.log(`🚀 Server running on port ${port}`);
}

bootstrap();