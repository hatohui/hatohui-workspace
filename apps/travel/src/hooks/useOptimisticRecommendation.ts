import {
  useQueryClient,
  type QueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import {
  getTravelDishQueryKey,
  getTravelDishesPageQueryKey,
  getTravelDishesQueryKey,
  getTravelPlaceQueryKey,
  getTravelPlacesPageQueryKey,
  getTravelPlacesQueryKey,
  getTravelRecommendationsQueryKey,
  type PaginatedTravelDishesDto,
  type PaginatedTravelPlacesDto,
  type TravelDishDetailDto,
  type TravelDishDto,
  type TravelDishesPageParams,
  type TravelPlaceAreaDto,
  type TravelPlaceDetailDto,
  type TravelPlaceDto,
  type TravelPlacesPageParams,
  type TravelRecommendationDto,
} from '@hatohui/models';
import { sameCatalogName } from '../lib/catalogName';
import {
  areaMatchesLocation,
  buildOptimisticDish,
  buildOptimisticPlace,
  buildOptimisticRecommendation,
  createOptimisticId,
  matchesSearchQuery,
  shouldPrependToQuery,
  lineAllergens,
} from '../lib/optimistic';
import type { PhotoItem } from './usePhotoList';
import {
  type DishLine,
  type RecommendationFields,
  pickedDishOf,
} from './useRecommendationFields';

interface Envelope<T> {
  data: T;
}

interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

interface ApplyParams {
  existing?: TravelRecommendationDto;
  fields: RecommendationFields;
  lines: DishLine[];
  place?: TravelPlaceDto;
  area: TravelPlaceAreaDto | null;
  photos: PhotoItem[];
}

type Snapshot = [QueryKey, unknown];

const mergeStrings = (current: string[], added: string[]) => [
  ...new Set([...current, ...added]),
];

function snapshot<T>(client: QueryClient, queryKey: QueryKey) {
  void client.cancelQueries({ queryKey });
  return client.getQueriesData<T>({ queryKey });
}

const isEnvelope = (value: unknown): boolean => {
  const data = (value as Envelope<unknown> | undefined)?.data;
  if (!data) return false;
  if (Array.isArray(data)) return true;
  const items = (data as Partial<Page<unknown>>).items;
  return items === undefined || Array.isArray(items);
};

function patchEach<T>(
  client: QueryClient,
  entries: [QueryKey, T | undefined][],
  patch: (current: T, key: QueryKey) => T | undefined,
) {
  for (const [key, current] of entries) {
    if (!current || !isEnvelope(current)) continue;
    const next = patch(current, key);
    if (next) client.setQueryData<T>(key, next);
  }
}

function prependToPage<T>(page: Page<T>, item: T): Page<T> {
  const total = page.total + 1;
  return {
    ...page,
    items: [item, ...page.items].slice(0, page.pageSize),
    total,
    hasMore: total > page.page * page.pageSize,
  };
}

export function useOptimisticRecommendation() {
  const client = useQueryClient();

  const apply = (params: ApplyParams) => {
    const { existing, fields, lines, place, area, photos } = params;
    const tempId = existing?.id ?? createOptimisticId();
    const tempPlaceId = createOptimisticId();
    const coverImageUrl = photos[0]?.url ?? null;
    const allergens = lineAllergens(lines);
    const pickedIds = lines.flatMap((line): string[] => {
      const picked = pickedDishOf(line);
      return picked ? [picked.id] : [];
    });
    const newDishes = lines
      .filter((line) => !pickedDishOf(line))
      .map((line) => ({ line, tempId: createOptimisticId() }));
    const placeId = place?.id ?? existing?.place.id;

    const optimistic = buildOptimisticRecommendation({
      id: tempId,
      existing,
      fields,
      lines,
      place,
      area,
      photos,
    });
    const replaceOrPrepend = (list: TravelRecommendationDto[]) =>
      existing
        ? list.map((item) => (item.id === existing.id ? optimistic : item))
        : [optimistic, ...list];

    const recs = snapshot<Envelope<TravelRecommendationDto[]>>(
      client,
      getTravelRecommendationsQueryKey(),
    );
    const dishDetails = pickedIds.flatMap((id) =>
      snapshot<Envelope<TravelDishDetailDto>>(
        client,
        getTravelDishQueryKey(id),
      ),
    );
    const placeDetails = placeId
      ? snapshot<Envelope<TravelPlaceDetailDto>>(
          client,
          getTravelPlaceQueryKey(placeId),
        )
      : [];
    const dishLists = snapshot<Envelope<TravelDishDto[]>>(
      client,
      getTravelDishesQueryKey(),
    );
    const dishPages = snapshot<Envelope<PaginatedTravelDishesDto>>(
      client,
      getTravelDishesPageQueryKey(),
    );
    const placeLists = snapshot<Envelope<TravelPlaceDto[]>>(
      client,
      getTravelPlacesQueryKey(),
    );
    const placePages = snapshot<Envelope<PaginatedTravelPlacesDto>>(
      client,
      getTravelPlacesPageQueryKey(),
    );

    patchEach(client, recs, (current, key) =>
      existing || shouldPrependToQuery(key, pickedIds, place?.id)
        ? { ...current, data: replaceOrPrepend(current.data) }
        : undefined,
    );
    patchEach(client, dishDetails, (current) => ({
      ...current,
      data: {
        ...current.data,
        placeCount: current.data.placeCount + (existing ? 0 : 1),
        allergens: mergeStrings(current.data.allergens, allergens),
        recommendations: replaceOrPrepend(current.data.recommendations),
      },
    }));
    patchEach(client, placeDetails, (current) => ({
      ...current,
      data: {
        ...current.data,
        dishCount: current.data.dishCount + (existing ? 0 : lines.length),
        allergens: mergeStrings(current.data.allergens, allergens),
        recommendations: replaceOrPrepend(current.data.recommendations),
      },
    }));

    if (!existing) {
      const patchDish = (item: TravelDishDto, inArea: boolean) => {
        const line = lines.find((l) => pickedDishOf(l)?.id === item.id);
        if (!line) return item;
        return {
          ...item,
          placeCount: item.placeCount + 1,
          localPlaceCount:
            item.localPlaceCount === null
              ? null
              : item.localPlaceCount + (inArea ? 1 : 0),
          allergens: mergeStrings(item.allergens, line.allergens),
          coverImageUrl: item.coverImageUrl ?? coverImageUrl,
        };
      };
      const newDishItems = (
        queryParams: TravelDishesPageParams | undefined,
      ): TravelDishDto[] =>
        newDishes
          .filter(({ line }) => matchesSearchQuery(line.name, queryParams?.q))
          .map(({ line, tempId: id }) =>
            buildOptimisticDish({
              id,
              line,
              area,
              coverImageUrl,
              queryParams,
            }),
          );

      patchEach(client, dishLists, (current, key) => {
        const queryParams = key[1] as TravelDishesPageParams | undefined;
        const inArea = areaMatchesLocation(area, queryParams);
        return {
          ...current,
          data: [
            ...newDishItems(queryParams),
            ...current.data.map((item) => patchDish(item, inArea)),
          ],
        };
      });
      patchEach(client, dishPages, (current, key) => {
        const queryParams = key[1] as TravelDishesPageParams | undefined;
        const inArea = areaMatchesLocation(area, queryParams);
        const patched = {
          ...current.data,
          items: current.data.items.map((item) => patchDish(item, inArea)),
        };
        const added =
          (queryParams?.page ?? 1) === 1 ? newDishItems(queryParams) : [];
        return {
          ...current,
          data: added.reduceRight(prependToPage, patched),
        };
      });

      const patchPlace = (item: TravelPlaceDto) =>
        item.id === place?.id
          ? {
              ...item,
              dishCount: item.dishCount + lines.length,
              allergens: mergeStrings(item.allergens, allergens),
              coverImageUrl: item.coverImageUrl ?? coverImageUrl,
            }
          : item;
      const newPlace = (queryParams?: TravelPlacesPageParams) =>
        !place &&
        matchesSearchQuery(fields.placeName, queryParams?.q) &&
        areaMatchesLocation(area, queryParams)
          ? buildOptimisticPlace({
              id: tempPlaceId,
              fields,
              lines,
              area,
              coverImageUrl,
            })
          : null;

      patchEach(client, placeLists, (current, key) => {
        const added = newPlace(key[1]);
        const data = current.data.map(patchPlace);
        return { ...current, data: added ? [added, ...data] : data };
      });
      patchEach(client, placePages, (current, key) => {
        const queryParams = key[1] as TravelPlacesPageParams | undefined;
        const patched = {
          ...current.data,
          items: current.data.items.map(patchPlace),
        };
        const added = (queryParams?.page ?? 1) === 1 && newPlace(queryParams);
        return {
          ...current,
          data: added ? prependToPage(patched, added) : patched,
        };
      });
    }

    const settle = (saved: TravelRecommendationDto) => {
      const savedCover =
        saved.images[0]?.thumbnailUrl ?? saved.images[0]?.url ?? null;
      const swapVisit = (list: TravelRecommendationDto[]) =>
        list.map((item) => (item.id === tempId ? saved : item));
      const settleDish = (item: TravelDishDto): TravelDishDto => {
        const temp = newDishes.find((entry) => entry.tempId === item.id);
        const line = temp
          ? saved.dishes.find((l) => sameCatalogName(l.dish.name, item.name))
          : undefined;
        if (!line) return item;
        return {
          ...item,
          id: line.dish.id,
          name: line.dish.name,
          cuisines: line.dish.cuisines,
          categories: line.dish.categories,
          imageUrl: line.dish.imageUrl,
          thumbnailUrl: line.dish.thumbnailUrl,
          previewUrl: line.dish.previewUrl,
          coverImageUrl:
            line.dish.thumbnailUrl ?? savedCover ?? item.coverImageUrl,
        };
      };
      const settlePlace = (item: TravelPlaceDto): TravelPlaceDto =>
        item.id === tempPlaceId
          ? {
              ...item,
              ...saved.place,
              coverImageUrl: savedCover ?? item.coverImageUrl,
            }
          : item;

      patchEach(
        client,
        client.getQueriesData<Envelope<TravelRecommendationDto[]>>({
          queryKey: getTravelRecommendationsQueryKey(),
        }),
        (current) => ({ ...current, data: swapVisit(current.data) }),
      );
      patchEach(client, dishDetails, (current) => ({
        ...current,
        data: {
          ...current.data,
          recommendations: swapVisit(current.data.recommendations),
        },
      }));
      patchEach(client, placeDetails, (current) => ({
        ...current,
        data: {
          ...current.data,
          recommendations: swapVisit(current.data.recommendations),
        },
      }));
      patchEach(
        client,
        client.getQueriesData<Envelope<TravelDishDto[]>>({
          queryKey: getTravelDishesQueryKey(),
        }),
        (current) => ({ ...current, data: current.data.map(settleDish) }),
      );
      patchEach(
        client,
        client.getQueriesData<Envelope<PaginatedTravelDishesDto>>({
          queryKey: getTravelDishesPageQueryKey(),
        }),
        (current) => ({
          ...current,
          data: { ...current.data, items: current.data.items.map(settleDish) },
        }),
      );
      patchEach(
        client,
        client.getQueriesData<Envelope<TravelPlaceDto[]>>({
          queryKey: getTravelPlacesQueryKey(),
        }),
        (current) => ({ ...current, data: current.data.map(settlePlace) }),
      );
      patchEach(
        client,
        client.getQueriesData<Envelope<PaginatedTravelPlacesDto>>({
          queryKey: getTravelPlacesPageQueryKey(),
        }),
        (current) => ({
          ...current,
          data: {
            ...current.data,
            items: current.data.items.map(settlePlace),
          },
        }),
      );
    };

    const rollback = () => {
      const all: Snapshot[] = [
        ...recs,
        ...dishDetails,
        ...placeDetails,
        ...dishLists,
        ...dishPages,
        ...placeLists,
        ...placePages,
      ];
      for (const [key, previous] of all) client.setQueryData(key, previous);
    };

    return { settle, rollback };
  };

  return { apply };
}
