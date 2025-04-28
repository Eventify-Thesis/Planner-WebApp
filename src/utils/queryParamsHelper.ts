import { QueryFilterCondition, QueryFilters } from "@/types/types";

export const queryParamsHelper = {
    LIMIT_PARAM: "limit",
    PAGE_PARAM: "page",
    KEYWORD_PARAM: "keyword",
    SORT_BY_PARAM: "sort_by",
    SORT_DIRECTION_PARAM: "sort_direction",
    FILTER_FIELDS: "filter_fields",

    DEFAULT_LIMIT: 20,
    DEFAULT_PAGE: 1,

    /**
     * Get a param from the URL
     *
     * @param param {string}
     * @param defaultReturn {*}
     */
    getParam: (param: string, defaultReturn: string | number = ''): string | number => {
        const urlParams = new URLSearchParams(window?.location.search);
        return urlParams.get(param) || defaultReturn;
    },

    /**
     * Build a query string of filter params
     *
     * @example "?per_page=10&page=1"
     */
    buildQueryString: (
        { page, limit, keyword, sortBy, sortDirection, filterFields = {}, additionalParams = {} }: QueryFilters
    ): string => {
        const baseParams: any = {
            [queryParamsHelper.PAGE_PARAM]: page ||
                queryParamsHelper.getParam(queryParamsHelper.PAGE_PARAM, queryParamsHelper.DEFAULT_PAGE),

            [queryParamsHelper.LIMIT_PARAM]: limit ||
                queryParamsHelper.getParam(queryParamsHelper.LIMIT_PARAM, queryParamsHelper.DEFAULT_LIMIT),

            [queryParamsHelper.KEYWORD_PARAM]: keyword ||
                queryParamsHelper.getParam(queryParamsHelper.KEYWORD_PARAM, ''),

            [queryParamsHelper.SORT_BY_PARAM]: sortBy ||
                queryParamsHelper.getParam(queryParamsHelper.SORT_BY_PARAM, ''),

            [queryParamsHelper.SORT_DIRECTION_PARAM]: sortDirection ||
                queryParamsHelper.getParam(queryParamsHelper.SORT_DIRECTION_PARAM, ''),
        };

        const filterParams = Object.entries(filterFields).reduce<Record<string, string>>((acc, [key, value]) => {
            if (Array.isArray(value)) {
                value.forEach((condition: QueryFilterCondition) => {
                    const paramKey = `filter_fields[${key}][${condition.operator}]`;
                    acc[paramKey] = String(condition.value);
                });
            } else if (typeof value === 'object' && value !== null) {
                const condition = value as QueryFilterCondition;
                const paramKey = `filter_fields[${key}][${condition.operator}]`;
                acc[paramKey] = String(condition.value);
            }
            return acc;
        }, {});

        const additionalParamsProcessed = Object.entries(additionalParams).reduce<Record<string, string>>((acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
        }, {});

        const combinedParams = { ...baseParams, ...filterParams, ...additionalParamsProcessed };

        return '?' + new URLSearchParams(combinedParams).toString();
    }
};
