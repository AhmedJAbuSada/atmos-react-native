import { makeCoordinates, type City } from '../../domain';
import type { CityDto } from '../remote/dtos';

const text = (value: string | undefined): string | undefined => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
};

/** A result without an id, a name or valid coordinates cannot be shown or saved: dropped. */
export function mapCity(dto: CityDto): City | undefined {
    const name = text(dto.name);
    const coordinates =
        dto.latitude !== undefined && dto.longitude !== undefined
            ? makeCoordinates(dto.latitude, dto.longitude)
            : undefined;
    if (dto.id === undefined || !name || !coordinates) {
        return undefined;
    }
    const region = text(dto.admin1);
    const country = text(dto.country);
    const countryCode = text(dto.country_code);
    return {
        id: dto.id,
        name,
        coordinates,
        ...(region ? { region } : {}),
        ...(country ? { country } : {}),
        ...(countryCode ? { countryCode } : {}),
    };
}

export function mapCities(dtos: readonly CityDto[]): City[] {
    return dtos.flatMap(dto => {
        const city = mapCity(dto);
        return city ? [city] : [];
    });
}
