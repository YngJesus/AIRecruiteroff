import { IsArray } from 'class-validator';

export class UpdateReviewQuestionsDto {
  @IsArray()
  questions: any[];
}
