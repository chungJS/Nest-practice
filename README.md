# Nest-practice
## 실행방법

Nest+Swagger+Prisma+Postgres → Docker compose

```jsx
yarn db:up
```

[localhost:3000/api에](http://localhost:3000/api에) 접속

---

### Nest 환경 구축

```jsx
yarn i -g @nestjs/cli
nest new practice
```

### Swagger 추가

[https://docs.nestjs.com/openapi/introduction](https://docs.nestjs.com/openapi/introduction)

```jsx
yarn add @nestjs/swagger
```

main.ts에 코드 추가

```jsx
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
```

feat: swagger added

### PostgreSQL DB 구축

```bash
brew install postgresql@16
brew services start postgresql@16
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
psql -v
```

```bash
psql postgres

CREATE ROLE postgres WITH LOGIN PASSWORD 'pw';
ALTER ROLE postgres CREATEDB;
ALTER ROLE postgres CREATEROLE;
```

```bash
psql postgres -U postgres

CREATE DATABASE test;
```

```bash
#postgresql 기본 포트는 5432
DATABASE_URL="postgresql://postgres:pw@localhost:5432/nesttest?schema=public"
```

### Prisma를 이용해 DB schema 구축

[https://docs.nestjs.com/recipes/prisma#set-up-prisma](https://docs.nestjs.com/recipes/prisma#set-up-prisma)

```csharp
yarn add prisma @prisma/client
npx prisma
npx prisma init

//.env 파일의 DB url 수정
```

```jsx
//schema.prisma에서 모델 생성
npx prisma migrate dev --name init
```

Prisma client를 이용해서 DB에서 가져오는 prisma.service.ts 코드

```jsx
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

이후 service,module에서 이 코드를 import해서 Prisma 서비스 호출

### todo 만들어보고 Docker에 적용

- nest+swagger+prisma+postgres 코드
    
    위의 과정들을 모두 하고 추가로 todo module을 추가해야한다
    
    ```jsx
    nest generate module todo
    nest g controller todo/controller --flat
    nest g service todo/service --flat
    ```
    
    main.ts에서 사용하는 모듈 변경
    
    ```jsx
    //import { AppModule } from './app.module';
    import { TodoModule } from './todo/todo.module';
    ```
    
    todo.module에서 prisma 서비스의 의존성 추가해주기 위해 provider에 추가
    
    ```jsx
    import { Module } from '@nestjs/common';
    import { TodoController } from './controller/todo.controller';
    import { TodoService } from './service/todo.service';
    import { PrismaService } from '../prisma.service';
    
    @Module({
      controllers: [TodoController],
      providers: [TodoService, PrismaService],
    })
    export class TodoModule {}
    ```
    
    DTO(data transfer object) 생성하기 위해 dto폴더에 index.ts, Tododto.ts 생성
    
    ```jsx
    //Tododto.ts
    import { ApiProperty } from '@nestjs/swagger';
    
    export class TodoDto {
      @ApiProperty()
      title: string;
    
      @ApiProperty()
      content: string;
    
      @ApiProperty()
      is_done: boolean;
    }
    ```
    
    ```jsx
    //index.ts
    export * from './Tododto';
    ```
    
    todo.service.ts에 prisma로 데이터 가져오는 코드 작성
    
    ```jsx
    import { Injectable } from '@nestjs/common';
    import { PrismaService } from '../../prisma.service';
    import { TodoDto } from '../dto';
    
    @Injectable()
    export class TodoService {
      constructor(private prismaService: PrismaService) {}
    
      async fetchAllTodos() {
        return this.prismaService.todo.findMany();
      }
    
      async fetchTodoItem(id: number) {
        return this.prismaService.todo.findUnique({ where: { id: Number(id) } });
      }
    
      async deleteTodoItem(id: number) {
        return this.prismaService.todo.delete({ where: { id: Number(id) } });
      }
    
      async addTodoItem(data: TodoDto) {
        return this.prismaService.todo.create({ data: data });
      }
    
      async updateTodoItem(
        id: number,
        title: string,
        content: string,
        is_done: boolean,
      ) {
        return this.prismaService.todo.update({
          where: { id: Number(id) },
          data: {
            title: title,
            content: content,
            is_done: is_done,
          },
        });
      }
    }
    
    ```
    
    todo.controller.ts에 라우팅을 위해 코드 작성
    
    ```jsx
    import {
      Controller,
      Get,
      Param,
      Delete,
      Post,
      Body,
      Put,
    } from '@nestjs/common';
    import { TodoService } from '../service/todo.service';
    import { TodoDto } from '../dto';
    
    @Controller('api/v1/todos')
    export class TodoController {
      constructor(private readonly todoService: TodoService) {}
    
      @Get()
      async fetchAllTodos() {
        return this.todoService.fetchAllTodos();
      }
      @Get(':id')
      async fetchTodoItem(@Param('id') id: number) {
        return this.todoService.fetchTodoItem(id);
      }
      @Delete(':id')
      async deleteTodoItem(@Param('id') id: number) {
        return this.todoService.deleteTodoItem(id);
      }
      @Post()
      async addTodoItem(@Body() dto: TodoDto) {
        return this.todoService.addTodoItem(dto);
      }
      @Put(':id')
      async updateTodoItem(@Param('id') id: number, @Body() dto: TodoDto) {
        return this.todoService.updateTodoItem(
          id,
          dto.title,
          dto.content,
          dto.is_done,
        );
      }
    }
    
    ```
    
    postgresql의 DB에 더미데이터 추가
    
    ```jsx
    psql postgres -U postgres
    \c nesttest
    insert into "Todo" values (1,'first','hello world','F');
    //작은 따음표를 사용해야 변수로 들어감
    insert into "Todo" values (2,'second','lorem ipsum','F');
    ```
    
    swagger를 이용해 테스트
    
    1. [http://localhost:3000/api](http://localhost:3000/api) 로 접속
    2. api 선택
    3. try it out 클릭
    4. execute 클릭
        
        ![스크린샷 2024-05-06 오전 12.16.26.png](%E1%84%8C%E1%85%A6%E1%84%86%E1%85%A9%E1%86%A8%20%E1%84%8B%E1%85%A5%E1%86%B9%E1%84%8B%E1%85%B3%E1%86%B7%20be780e53603d4c578dae84c90ea439a7/%25E1%2584%2589%25E1%2585%25B3%25E1%2584%258F%25E1%2585%25B3%25E1%2584%2585%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2589%25E1%2585%25A3%25E1%2586%25BA_2024-05-06_%25E1%2584%258B%25E1%2585%25A9%25E1%2584%258C%25E1%2585%25A5%25E1%2586%25AB_12.16.26.png)
        
    

위의 코드를 docker ubuntu 환경에 업로드 해서 서비스

dockerfile compose하기

```jsx
FROM node

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install

COPY . .

EXPOSE 3000

CMD["yarn", 'start']
```

```jsx
docker build -t nestpractice .
docker run -e DATABASE_URL="postgresql://postgres:pw@host.docker.internal:5432/nesttest?schema=public" -p 3000:3000 --name nestpractice nestpractice
```

<aside>
💡 도커환경에서 prisma client의 쿼리엔진을 찾지 못하는 경우가 생기므로 schema.prisma 파일 코드를 수정하고 다시 클라이언트를 생성해주었다

```jsx
//쿼리엔진 올바르게 정해주고
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "linux-arm64-openssl-3.0.x"]
}
//클라이언트 재생성
npx prisma generate
```

</aside>

이렇게 하면 도커에서 api가 실행되고 로컬에서 실행중인 db랑 연결되게 된다.

## AI

먼저 Langchain은 프레임워크로 우리가 어떤 모델을 이용해서 어플리케이션을 만들때 이를 컨트롤 하게 도와준다 그리고 라마랑 챗GPT는 LLM 모델이다. 그러므로 우리는 랭체인을 이용해 라마를 사용하는 방식으로 할 예정이다. 하지만 지금 라마-3가 한국어 파인튜닝된 버전이 좋게 나온게 없어서 라마2를 이용해야할 수 도있지만 시간이 지날 수록 누가 만들어 올릴테니 미리 라마3로 이용하고 있는 것이 좋을것 같음