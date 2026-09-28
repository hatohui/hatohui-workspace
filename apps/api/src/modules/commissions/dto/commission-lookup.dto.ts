import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateClientNoteDto {
  @ApiProperty({ example: 'Looks great, approved!' })
  @IsString()
  @IsNotEmpty()
  body: string;
}
