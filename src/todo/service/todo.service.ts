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
