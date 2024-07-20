import { ref, onMounted, watch, nextTick } from 'vue';
import { isDarkModeStorage } from '@/utils/storage';

export function useDarkMode() {
  const isDarkMode = ref<boolean>(false);

  const isAppearanceTransition =
    // @ts-ignore
    document.startViewTransition &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const toggleDark = async (event?: MouseEvent) => {
    const DARK = 'dark';
    isDarkMode.value = !isDarkMode.value;
    await isDarkModeStorage.setValue(isDarkMode.value);
    if (!isAppearanceTransition || !event) {
      return;
    }
    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // @ts-expect-error: Transition API
    const transition = document.startViewTransition(async () => {
      if (isDarkMode.value) {
        document.documentElement.classList.add(DARK);
      } else {
        document.documentElement.classList.remove(DARK);
      }
      await nextTick();
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];
      document.documentElement.animate(
        {
          clipPath: isDarkMode.value ? [...clipPath].reverse() : clipPath,
        },
        {
          duration: 250,
          easing: 'ease-in',
          pseudoElement: isDarkMode.value
            ? '::view-transition-old(root)'
            : '::view-transition-new(root)',
        }
      );
    });
  };

  onMounted(async () => {
    isDarkMode.value = await isDarkModeStorage.getValue();
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  });

  watch(isDarkMode, (newVal) => {
    if (newVal) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  });

  return {
    isDarkMode,
    toggleDark,
  };
}
