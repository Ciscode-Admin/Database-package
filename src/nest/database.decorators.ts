// src/nest/database.decorators.ts
import { Inject } from '@nestjs/common';
import { DATABASE_TOKEN } from './database.module';

export const InjectDatabase = () => Inject(DATABASE_TOKEN);
