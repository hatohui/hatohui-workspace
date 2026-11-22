export const withTag = (list: string[], tag: string, on: boolean) =>
  on
    ? list.includes(tag)
      ? list
      : [...list, tag]
    : list.filter((item) => item !== tag);
