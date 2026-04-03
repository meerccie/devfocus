import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. SECURE CORS: Replace '*' with your actual Vercel URL in production
  app.enableCors({
    origin: [
      'http://localhost:5173', // Local Vite dev server
      'https://your-portfolio.vercel.app', // Your actual Vercel domain
      /\.vercel\.app$/, // Allows all your Vercel preview deployments
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 2. BIND TO 0.0.0.0: Required for Railway/Docker to route traffic correctly
  const port = process.env.PORT || 3000;

  // 3. LISTEN: Ensure the app accepts external connections
  await app.listen(port, '0.0.0.0');

  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
