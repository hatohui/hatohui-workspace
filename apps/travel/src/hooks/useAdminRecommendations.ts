import { useMemo, useState } from 'react';
import { useTranslation } from '@hatohui/i18n';
import {
  getTravelRecommendationsQueryKey,
  useCreateTravelRecommendation,
  useDeleteTravelRecommendation,
  useTravelDishes,
  useTravelPlaces,
  useTravelRecommendations,
  useUpdateTravelRecommendation,
  type CreateTravelRecommendationDtoCurrency,
  type TravelPriceLevel,
  type TravelRecommendationDto,
} from '@hatohui/models';
import type { EditableColumn } from '@hatohui/ui';
import {
  CURRENCIES,
  DEFAULT_CURRENCY,
  PRICE_LEVELS,
} from '../constants/travel';
import { formatAddedDate } from '../lib/formatDate';
import { useAdminAction } from './useAdminAction';
import { useAdminTableControls } from './useAdminTableControls';
import { useColumnVisibility } from './useColumnVisibility';
import { useRowDeletion } from './useRowDeletion';
import { useTagOptions } from './useTagOptions';
import { useTravelLocation } from './useTravelLocation';

export interface AdminRecommendationRow {
  id: string;
  name: string;
  dish: string;
  place: string;
  mapsUrl: string;
  spicy: string;
  diets: string;
  allergens: string;
  price: string;
  currency: string;
  note: string;
  createdAt: string;
  isDraft?: boolean;
}

const DRAFT_PREFIX = 'draft:';
const STORAGE_KEY = 'travel-admin-recommendations';
const DEFAULT_HIDDEN = ['price', 'currency', 'mapsUrl', 'createdAt'] as const;

function formatPriceCell(rec: TravelRecommendationDto): string {
  if (rec.priceLevel) return rec.priceLevel;
  if (rec.priceMin != null && rec.priceMax != null) {
    return rec.priceMin === rec.priceMax
      ? String(rec.priceMin)
      : `${rec.priceMin}-${rec.priceMax}`;
  }
  if (rec.priceMin != null) return String(rec.priceMin);
  if (rec.priceMax != null) return String(rec.priceMax);
  return '';
}

function parsePriceCell(raw: string): {
  priceMin: number | null;
  priceMax: number | null;
  priceLevel: TravelPriceLevel | null;
} {
  const trimmed = raw.trim().toUpperCase();
  if (!trimmed) return { priceMin: null, priceMax: null, priceLevel: null };
  if ((PRICE_LEVELS as readonly string[]).includes(trimmed)) {
    return {
      priceMin: null,
      priceMax: null,
      priceLevel: trimmed as TravelPriceLevel,
    };
  }
  const parts = trimmed
    .split(/[-–—]/)
    .map((part) => Number(part.replace(/[^0-9.]/g, '')))
    .filter((num) => Number.isFinite(num) && num >= 0);
  if (parts.length === 0) {
    return { priceMin: null, priceMax: null, priceLevel: null };
  }
  const min = Math.round(parts[0]);
  const max = Math.round(parts[1] ?? parts[0]);
  return { priceMin: min, priceMax: max, priceLevel: null };
}

const parseList = (raw: string) =>
  raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export function useAdminRecommendations() {
  const { t } = useTranslation();
  const location = useTravelLocation();
  const query = useTravelRecommendations();
  const dishesQuery = useTravelDishes();
  const placesQuery = useTravelPlaces();
  const tags = useTagOptions();
  const create = useCreateTravelRecommendation();
  const update = useUpdateTravelRecommendation();
  const remove = useDeleteTravelRecommendation();
  const { run } = useAdminAction();
  const [drafts, setDrafts] = useState<AdminRecommendationRow[]>([]);

  const items = useMemo(() => query.data?.data ?? [], [query.data?.data]);
  const dishes = useMemo(
    () => dishesQuery.data?.data ?? [],
    [dishesQuery.data?.data],
  );
  const places = useMemo(
    () => placesQuery.data?.data ?? [],
    [placesQuery.data?.data],
  );

  const dishSuggestions = useMemo(
    () => dishes.map((dish) => ({ value: dish.name })),
    [dishes],
  );
  const placeSuggestions = useMemo(
    () =>
      places.map((place) => ({
        value: place.name,
        hint: place.area?.name,
      })),
    [places],
  );

  const savedRows = useMemo<AdminRecommendationRow[]>(
    () =>
      items.map((rec) => ({
        id: rec.id,
        name: `${rec.dish.name} — ${rec.place.name}`,
        dish: rec.dish.name,
        place: rec.place.name,
        mapsUrl: rec.place.mapsUrl ?? '',
        spicy: String(rec.spicy),
        diets: rec.diets.join(', '),
        allergens: rec.allergens.join(', '),
        price: formatPriceCell(rec),
        currency: rec.currency,
        note: rec.note ?? '',
        createdAt: rec.createdAt,
      })),
    [items],
  );

  const rows = useMemo(() => [...savedRows, ...drafts], [drafts, savedRows]);

  const columns = useMemo<EditableColumn<AdminRecommendationRow>[]>(
    () => [
      {
        key: 'dish',
        label: t('admin.dish'),
        editable: (row) => Boolean(row.isDraft),
        sortable: true,
        suggestions: dishSuggestions,
        maxTags: 1,
        createLabel: (tag) => t('form.cuisineCreate', { tag }),
        removeLabel: (tag) => t('form.cuisineRemove', { tag }),
        size: 160,
      },
      {
        key: 'place',
        label: t('admin.place'),
        editable: (row) => Boolean(row.isDraft),
        sortable: true,
        suggestions: placeSuggestions,
        maxTags: 1,
        createLabel: (tag) => t('form.cuisineCreate', { tag }),
        removeLabel: (tag) => t('form.cuisineRemove', { tag }),
        size: 170,
      },
      {
        key: 'mapsUrl',
        label: t('admin.mapsLink'),
        editable: (row) => Boolean(row.isDraft),
        size: 160,
      },
      {
        key: 'spicy',
        label: t('catalog.spicy'),
        editable: true,
        toggle: true,
      },
      {
        key: 'diets',
        label: t('form.diets'),
        editable: true,
        suggestions: tags.dietKeys.map((key) => ({ value: key })),
        size: 140,
      },
      {
        key: 'allergens',
        label: t('form.allergens'),
        editable: true,
        suggestions: tags.allergenKeys.map((key) => ({ value: key })),
        size: 140,
      },
      {
        key: 'price',
        label: t('form.sectionPrice'),
        editable: true,
        sortable: true,
        size: 120,
      },
      {
        key: 'currency',
        label: t('admin.code'),
        editable: true,
        sortable: true,
        options: CURRENCIES.map((c) => ({ value: c, label: c })),
        size: 80,
      },
      {
        key: 'note',
        label: t('admin.note'),
        editable: true,
        sortable: true,
        size: 200,
      },
      {
        key: 'createdAt',
        label: t('admin.added'),
        sortable: true,
        render: (row) => formatAddedDate(row.createdAt),
        size: 120,
      },
    ],
    [dishSuggestions, placeSuggestions, t, tags.allergenKeys, tags.dietKeys],
  );

  const controls = useAdminTableControls(rows, columns, {
    key: 'createdAt',
    direction: 'desc',
  });
  const visibility = useColumnVisibility(STORAGE_KEY, columns, DEFAULT_HIDDEN);
  const queryKey = getTravelRecommendationsQueryKey();

  const deletion = useRowDeletion<AdminRecommendationRow>(
    (row) => {
      if (row.isDraft) {
        setDrafts((current) => current.filter((d) => d.id !== row.id));
        return Promise.resolve(true);
      }
      return run<{ data: TravelRecommendationDto[] }>(
        () => remove.mutateAsync({ id: row.id }),
        {
          queryKey,
          apply: (current) => ({
            ...current,
            data: current.data.filter((item) => item.id !== row.id),
          }),
        },
      );
    },
    (row) => !row.isDraft,
  );

  const addRow = () => {
    setDrafts((current) => [
      ...current,
      {
        id: `${DRAFT_PREFIX}${crypto.randomUUID()}`,
        name: '',
        dish: '',
        place: '',
        mapsUrl: '',
        spicy: 'false',
        diets: '',
        allergens: '',
        price: '',
        currency: DEFAULT_CURRENCY,
        note: '',
        createdAt: '',
        isDraft: true,
      },
    ]);
  };

  const commit = (
    id: string,
    key: keyof AdminRecommendationRow,
    value: string,
  ) => {
    if (id.startsWith(DRAFT_PREFIX)) {
      const existing = drafts.find((d) => d.id === id);
      if (!existing) return;
      const next = { ...existing, [key]: value };
      setDrafts((current) => current.map((d) => (d.id === id ? next : d)));
      const dishName = next.dish.trim();
      const placeName = next.place.trim();
      if (dishName && placeName) {
        const matchedDish = dishes.find(
          (d) => d.name.toLowerCase() === dishName.toLowerCase(),
        );
        const matchedPlace = places.find(
          (p) => p.name.toLowerCase() === placeName.toLowerCase(),
        );
        const price = parsePriceCell(next.price);
        void run(async () => {
          await create.mutateAsync({
            data: {
              dishId: matchedDish?.id,
              dishName: matchedDish ? undefined : dishName,
              placeId: matchedPlace?.id,
              place: matchedPlace
                ? undefined
                : {
                    name: placeName,
                    mapsUrl: next.mapsUrl.trim() || undefined,
                    areaId: location.area?.id,
                  },
              spicy: next.spicy === 'true',
              diets: parseList(next.diets),
              allergens: parseList(next.allergens),
              currency: next.currency as CreateTravelRecommendationDtoCurrency,
              note: next.note || undefined,
              ...price,
            },
          });
          setDrafts((current) => current.filter((d) => d.id !== id));
        });
      }
      return;
    }

    const patch =
      key === 'spicy'
        ? { spicy: value === 'true' }
        : key === 'diets'
          ? { diets: parseList(value) }
          : key === 'allergens'
            ? { allergens: parseList(value) }
            : key === 'price'
              ? parsePriceCell(value)
              : key === 'currency'
                ? { currency: value as CreateTravelRecommendationDtoCurrency }
                : { note: value };

    void run<{ data: TravelRecommendationDto[] }>(
      () => update.mutateAsync({ id, data: patch }),
      {
        queryKey,
        apply: (current) => ({
          ...current,
          data: current.data.map((item) =>
            item.id === id ? { ...item, ...patch } : item,
          ),
        }),
      },
    );
  };

  return {
    storageKey: STORAGE_KEY,
    rows: controls.pagedRows,
    allColumns: columns,
    columns: visibility.visibleColumns,
    hiddenColumns: visibility.hiddenSet,
    toggleColumn: visibility.toggle,
    isLoading: query.isLoading,
    search: controls.search,
    setSearch: controls.setSearch,
    suggestions: controls.suggestions,
    sortBy: controls.sortBy,
    sortDirection: controls.sortDirection,
    onSortChange: controls.onSortChange,
    page: controls.page,
    setPage: controls.setPage,
    pageSize: controls.pageSize,
    setPageSize: controls.setPageSize,
    totalRows: controls.totalRows,
    totalPages: controls.totalPages,
    deletion,
    commit,
    addRow,
  };
}
