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
