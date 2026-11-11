import { DomainErrors, type DomainError } from '../../src/domain';
import { errorMessageKey } from '../../src/presentation/errorMessage';
import { createI18n } from '../../src/presentation/i18n/i18n';

const SHOWN: DomainError[] = [
    DomainErrors.noConnection,
    DomainErrors.timeout,
    DomainErrors.server(503),
    DomainErrors.notFound,
    DomainErrors.locationPermissionDenied,
    DomainErrors.locationUnavailable,
    DomainErrors.unknown,
];

describe('errorMessageKey', () => {
    test.each(['en', 'tr', 'ar'] as const)(
        'every shown error has a real message in %s',
        language => {
            const { t } = createI18n(language);
            SHOWN.forEach(error => {
                const key = errorMessageKey(error);
                expect(key).toBeDefined();
                // A missing translation would come back as the key itself.
                expect(key && t(key)).not.toBe(key);
            });
        },
    );

    test('a cancellation has no message: it is never shown (ADR-0006)', () => {
        expect(errorMessageKey(DomainErrors.cancelled)).toBeUndefined();
    });
});
