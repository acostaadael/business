import { ApiProperty } from '@nestjs/swagger';

export class IdNameDTO {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Nombre' })
  name: string;
}
