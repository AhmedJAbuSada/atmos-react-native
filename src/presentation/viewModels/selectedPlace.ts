import {
    CURRENT_LOCATION,
    samePlace,
    ValueStore,
    type City,
    type Place,
} from '../../domain';

/**
 * Which place Home shows. Cities writes it, Home reads it: a small piece of shared UI state,
 * in memory on purpose (the app always opens on the current location).
 */
export type SelectedPlace = ValueStore<Place>;

export function createSelectedPlace(): SelectedPlace {
    return new ValueStore<Place>(CURRENT_LOCATION, samePlace);
}

/** If the removed city is on screen, Home goes back to the current location. */
export function cityRemoved(selected: SelectedPlace, city: City): void {
    const place = selected.get();
    if (place.kind === 'saved' && place.city.id === city.id) {
        selected.set(CURRENT_LOCATION);
    }
}
