import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsString,
  validateSync,
} from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { LogsLevelEnum } from '../log/enums/log-levels.enum';

class EnvironmentVariables {
  @IsString()
  HOST: string;

  @IsNumber()
  PORT: number;

  @IsNumber()
  MICROSERVICE_PORT: number;

  @IsString()
  @IsEnum(LogsLevelEnum)
  LOG_LEVEL: LogsLevelEnum;

  @IsBoolean()
  LOG_FILE: boolean;

  @IsString()
  DB_HOST: string;

  @IsNumber()
  DB_PORT: number;

  @IsString()
  DB_NAME: string;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  JWT_SECRET: string;

  @IsNumber()
  PASSWORD_SALT: number;

  @IsString()
  JWT_EXPIRATION_TIME: string;

  @IsString()
  REFRESH_TOKEN_SECRET: string;

  @IsString()
  REFRESH_TOKEN_EXPIRATION: string;
}

export function validateEnv(config: Record<string, unknown>) {
  config.LOG_FILE = config.LOG_FILE === 'true' ? true : false;
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors?.toString());
  }
  return validatedConfig;
}
