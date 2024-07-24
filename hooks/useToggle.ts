import { ref } from 'vue';

// experimental
function useToggle(initialValue = false) {
  const state = ref(initialValue);
  const toggle = () => {
    state.value = !state.value;
  };

  return {
    state,
    toggle,
  };
}

export default useToggle;
