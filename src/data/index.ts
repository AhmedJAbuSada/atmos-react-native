import { DOMAIN_LAYER } from '../domain';

/**
 * # src/data
 *
 * Talks to the outside world (Open-Meteo, AsyncStorage, location) and implements the
 * repository interfaces declared in `src/domain` (step 04).
 */
export const DATA_LAYER = 'data';

/** Proves the allowed direction: data may use the domain. */
export const DATA_DEPENDS_ON = DOMAIN_LAYER;
