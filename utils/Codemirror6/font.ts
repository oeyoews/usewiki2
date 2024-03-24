import { EditorView } from '@codemirror/view';

/** @see-also https://codemirror.net/examples/styling */
export function Font() {
  return EditorView.theme({
    '.cm-scroller': {
      // fontFamily: font!,
    },
    '.cm-tooltip-autocomplete > ul': {
      // fontFamily: `${font} !important`,
    },
    '&.cm-editor': {
      fontSize: '18px',
    },
  });
}
