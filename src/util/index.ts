import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: string[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(value: any) {
    if (!value) return 'Bs0';

    return 'Bs' + value.toLocaleString('en-US', { style: 'currency', currency: 'USD' }).replace('$', '');
}

export type TypeWithKey<T> = { [key: string]: T };

export const findProp = (
    obj: TypeWithKey<any>,
    props: string,
    defval?: any
  ) => {
    if (typeof defval == "undefined") defval = null;
    const prop = props.split(".");
    for (var i = 0; i < prop.length; i++) {
      if (typeof obj[prop[i]] == "undefined") return defval;
      obj = obj[prop[i]];
    }
    return obj;
  };
