import { DEFAULT_SETTINGS } from '../../../src/domain';
import { createSettingsViewModel } from '../../../src/presentation/viewModels/settingsViewModel';
import { FakeSettingsRepository } from '../../../src/testing';

describe('SettingsViewModel (US-08)', () => {
    test('shows the stored settings and saves a change', async () => {
        const repository = new FakeSettingsRepository();
        const viewModel = createSettingsViewModel(repository);
        viewModel.start();
        expect(viewModel.store.getState()).toEqual(DEFAULT_SETTINGS);
        await viewModel.change({ theme: 'dark' });
        expect(viewModel.store.getState().theme).toBe('dark');
        expect(repository.store.get().theme).toBe('dark');
    });

    test('a change made elsewhere reaches this screen too', async () => {
        const repository = new FakeSettingsRepository();
        const viewModel = createSettingsViewModel(repository);
        const stop = viewModel.start();
        await repository.updateSettings({ windSpeedUnit: 'milesPerHour' });
        expect(viewModel.store.getState().windSpeedUnit).toBe('milesPerHour');
        stop();
        await repository.updateSettings({ windSpeedUnit: 'metersPerSecond' });
        expect(viewModel.store.getState().windSpeedUnit).toBe('milesPerHour'); // stopped
    });
});
