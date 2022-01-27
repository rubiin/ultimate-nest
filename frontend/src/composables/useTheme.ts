import { Ref } from 'vue';
import { useDark, useToggle } from '@vueuse/core';

export interface ThemeComposition {
  isDark: Ref<boolean>;
  toggleDark: () => boolean;
}

export function useTheme(): ThemeComposition {
  const isDark = useDark();
  const toggleDark = useToggle(isDark);

  return {
    isDark,
    toggleDark,
  };
}
