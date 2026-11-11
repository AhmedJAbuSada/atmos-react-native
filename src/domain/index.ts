/**
 * # src/domain — the business core
 *
 * Plain TypeScript only: no React, no React Native, no native package (ADR-0001). Other
 * layers import from here, never the other way round.
 */
export * from './common/dateProvider';
export * from './common/domainError';
export * from './common/result';
export * from './common/valueStore';
export * from './location/city';
export * from './location/cityUseCases';
export * from './location/coordinates';
export * from './location/repositories';
export * from './settings/units';
export * from './settings/userSettings';
export * from './weather/forecast';
export * from './weather/getForecast';
export * from './weather/weatherCondition';
