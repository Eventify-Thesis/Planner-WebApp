import { Select, TextInput, TextInputProps } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import classes from './SearchBar.module.scss';
import { useEffect, useState } from 'react';
import { SortSelector, SortSelectorProps } from '../SortSelector';
// import { t } from '@lingui/macro';
import classNames from 'classnames';
import { PaginationData, QueryFilters } from '@/types/types.ts';
import { useTranslation } from 'react-i18next';

interface SearchBarProps extends TextInputProps {
  onClear: () => void;
  sortProps?: SortSelectorProps | undefined;
  shows?: { value: string; label: string }[];
  setSearchParams?: (updates: Partial<QueryFilters>) => void;
  searchParams?: Partial<QueryFilters>;
}

interface SearchBarWrapperProps {
  placeholder?: string;
  setSearchParams?: (updates: Partial<QueryFilters>) => void;
  searchParams: Partial<QueryFilters>;
  pagination?: PaginationData;
  shows?: { value: string; label: string }[];
}

export const SearchBarWrapper = ({
  setSearchParams,
  searchParams,
  shows,
  placeholder,
}: SearchBarWrapperProps) => {
  const { t } = useTranslation();
  return (
    <SearchBar
      value={searchParams.keyword}
      onChange={(event) => {
        setSearchParams({
          keyword: event.target.value,
          page: 1,
        });
      }}
      onClear={() =>
        setSearchParams({
          keyword: '',
          page: 1,
        })
      }
      shows={shows}
      setSearchParams={setSearchParams}
      searchParams={searchParams}
      placeholder={placeholder || t`Search...`}
      // sortProps={
      //   pagination
      //     ? {
      //         selected:
      //           searchParams.sortBy && searchParams.sortDirection
      //             ? searchParams.sortBy + ':' + searchParams.sortDirection
      //             : pagination?.default_sort +
      //               ':' +
      //               pagination?.default_sort_direction,
      //         options: pagination?.allowed_sorts,
      //         onSortSelect: (key, sortDirection) => {
      //           setSearchParams({
      //             sortBy: key,
      //             sortDirection: sortDirection,
      //           });
      //         },
      //       }
      //     : undefined
      // }
    />
  );
};

export const SearchBar = ({
  sortProps,
  onClear,
  value,
  onChange,
  shows,
  setSearchParams,
  searchParams,
  ...props
}: SearchBarProps) => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState<typeof value>(value);

  useEffect(() => {
    setSearchValue(value);
  }, [value]);

  return (
    <div className={classNames(classes.searchBarWrapper, props.className)}>
      <TextInput
        className={classes.searchBar}
        leftSection={<IconSearch size="1.1rem" stroke={1.5} />}
        radius="sm"
        size="md"
        value={searchValue}
        {...props}
        onChange={(event) => {
          setSearchValue(event.currentTarget.value);
          if (onChange) {
            onChange(event);
          }
        }}
        rightSection={
          <IconX
            aria-label={t`Clear Search Text`}
            color={'#ddd'}
            style={{ cursor: 'pointer' }}
            display={value ? 'block' : 'none'}
            onClick={() => onClear()}
          />
        }
      />

      {shows && (
        <Select
          placeholder={t`Select show`}
          data={shows}
          value={searchParams.showId || undefined}
          onChange={(value) => setSearchParams({ showId: value, page: 1 })}
          clearable
          style={{ width: '200px', flex: '0 0 auto' }}
          size="md"
        />
      )}

      {/* {sortProps && (
        <SortSelector
          selected={sortProps.selected}
          options={sortProps.options}
          onSortSelect={sortProps.onSortSelect}
        />
      )} */}
    </div>
  );
};
