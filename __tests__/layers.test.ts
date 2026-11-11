import { DATA_DEPENDS_ON } from '../src/data';
import { DOMAIN_LAYER } from '../src/domain';

test('the data layer depends on the domain layer', () => {
    expect(DATA_DEPENDS_ON).toBe(DOMAIN_LAYER);
});
