import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
//import { AppModule } from './app.module';
import { TodoModule } from './todo/todo.module';

async function bootstrap() {
  const app = await NestFactory.create(TodoModule, { cors: true });

  const config = new DocumentBuilder()
    .setTitle('nest-practice')
    .setDescription('practice project')
    .setVersion('1.0')
    .addTag('HIGT')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
