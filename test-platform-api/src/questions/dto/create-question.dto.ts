import { ApiProperty } from "@nestjs/swagger";
import { QuestionType } from "@prisma/client";
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  question: string;

  @IsString()
  @ApiProperty({ required: false })
  description: string;

  @IsArray()
  @IsNotEmpty()
  @ApiProperty({ required: true, isArray: true, type: Number })
  answer: number[];

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  category: string;

  @IsArray()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  options: string[];

  @IsOptional()
  @ApiProperty({ required: true, enum: QuestionType })
  @IsEnum(QuestionType)
  type: QuestionType;
}
