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
import { useAdminAction } from './useAdminAction';
import { useAdminTableSearch } from './useAdminTableSearch';
import { useRowDeletion } from './useRowDeletion';
import { useTagOptions } from './useTagOptions';

export interface AdminRecommendationRow {
  id: string;
  name: string;
  dishId: string;
  placeId: string;
  spicy: string;
  diets: string;
  allergens: string;
  price: string;
  currency: string;
  note: string;
  isDraft?: boolean;
}

const DRAFT_PREFIX = 'draft:';

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

  const dishOptions = useMemo(
    () => dishes.map((dish) => ({ value: dish.id, label: dish.name })),
    [dishes],
  );
  const placeOptions = useMemo(
    () =>
      places.map((place) => ({
        value: place.id,
        label: place.area ? `${place.name} (${place.area.name})` : place.name,
      })),
    [places],
  );
  const dishNames = useMemo(
    () => new Map(dishes.map((d) => [d.id, d.name])),
    [dishes],
  );
  const placeNames = useMemo(
    () =>
      new Map(
        places.map((p) => [
          p.id,
          p.area ? `${p.name} (${p.area.name})` : p.name,
        ]),
      ),
    [places],
  );

  const savedRows = useMemo<AdminRecommendationRow[]>(
    () =>
      items.map((rec) => ({
        id: rec.id,
        name: `${rec.dish.name} — ${rec.place.name}`,
        dishId: rec.dish.id,
        placeId: rec.place.id,
        spicy: String(rec.spicy),
        diets: rec.diets.join(', '),
        allergens: rec.allergens.join(', '),
        price: formatPriceCell(rec),
        currency: rec.currency,
        note: rec.note ?? '',
      })),
    [items],
  );

  const rows = useMemo(() => [...savedRows, ...drafts], [drafts, savedRows]);

  const columns = useMemo<EditableColumn<AdminRecommendationRow>[]>(
    () => [
      {
        key: 'dishId',
        label: t('admin.dish'),
        editable: (row) => Boolean(row.isDraft),
        options: dishOptions,
        render: (row) => dishNames.get(row.dishId) ?? '',
        size: 180,
      },
      {
        key: 'placeId',
        label: t('admin.place'),
        editable: (row) => Boolean(row.isDraft),
        options: placeOptions,
        render: (row) => placeNames.get(row.placeId) ?? '',
        size: 200,
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
        size: 160,
      },
      {
        key: 'allergens',
        label: t('form.allergens'),
        editable: true,
        suggestions: tags.allergenKeys.map((key) => ({ value: key })),
        size: 160,
      },
      {
        key: 'price',
        label: t('form.sectionPrice'),
        editable: true,
        size: 130,
      },
      {
        key: 'currency',
        label: t('admin.code'),
        editable: true,
        options: CURRENCIES.map((c) => ({ value: c, label: c })),
        size: 90,
      },
      {
        key: 'note',
        label: t('admin.note'),
        editable: true,
        size: 220,
      },
    ],
    [
      dishNames,
      dishOptions,
      placeNames,
      placeOptions,
      t,
      tags.allergenKeys,
      tags.dietKeys,
    ],
  );

  const tableSearch = useAdminTableSearch(rows, columns);
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
        dishId: '',
        placeId: '',
        spicy: 'false',
        diets: '',
        allergens: '',
        price: '',
        currency: DEFAULT_CURRENCY,
        note: '',
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
      if (next.dishId && next.placeId) {
        const price = parsePriceCell(next.price);
        void run(async () => {
          await create.mutateAsync({
            data: {
              dishId: next.dishId,
              placeId: next.placeId,
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
    rows: tableSearch.filteredRows,
    columns,
    isLoading: query.isLoading,
    search: tableSearch.search,
    setSearch: tableSearch.setSearch,
    suggestions: tableSearch.suggestions,
    deletion,
    commit,
    addRow,
  };
}
