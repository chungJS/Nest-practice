import { ApiProperty } from '@nestjs/swagger';

export class TodoDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  is_done: boolean;
}
