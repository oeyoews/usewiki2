<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { EditorState, type Extension } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, placeholder } from '@codemirror/view';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import {
  defaultKeymap,
  indentWithTab,
  history,
  historyKeymap,
} from '@codemirror/commands';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
  modelValue: string;
  placeholder?: string;
  darkMode?: boolean;
  fontSize?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
  (e: 'keyup', event: KeyboardEvent): void;
}>();

// Handle keyboard events
const handleKeyUp = (event: KeyboardEvent) => {
  if (event.ctrlKey && event.key === 'Enter') {
    emit('keyup', event);
  }

  // Show key bindings help (Ctrl+H)
  if (event.ctrlKey && event.key === 'h') {
    showKeyBindingsHelp();
  }
};

// Show key bindings help info
const showKeyBindingsHelp = () => {
  const helpInfo = `
Markdown Editor Key Bindings:

Basic Editing:
- Ctrl+Z: Undo
- Ctrl+Y/Ctrl+Shift+Z: Redo
- Ctrl+X/C/V: Cut/Copy/Paste
- Ctrl+S: Save
- Tab: Indent
- Shift+Tab: Outdent

Markdown Formatting:
- Ctrl+B: Bold text
- Ctrl+I: Italic text
- Ctrl+K: Insert link
- Ctrl+/: Toggle comment
- Alt+1: Heading 1
- Alt+2: Heading 2
- Alt+L: Unordered list
- Alt+C: Code block

- Ctrl+H: Show this help
`;

  alert(helpInfo);
};

const editorRef = ref<HTMLElement | null>(null);
let view: EditorView | null = null;

// Create the editor when the component is mounted
onMounted(() => {
  if (!editorRef.value) return;

  const startState = EditorState.create({
    doc: props.modelValue || '',
    extensions: getExtensions(),
  });

  view = new EditorView({
    state: startState,
    parent: editorRef.value,
    dispatch: (tr) => {
      if (view) {
        view.update([tr]);
        if (tr.docChanged) {
          const newValue = view.state.doc.toString();
          emit('update:modelValue', newValue);
          emit('change', newValue);
        }
      }
    },
  });
});

// Update the editor content when the modelValue prop changes
watch(
  () => props.modelValue,
  (newValue) => {
    if (view && newValue !== view.state.doc.toString()) {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: newValue || '',
        },
      });
    }
  }
);

// Update the editor theme when darkMode changes
watch(
  () => props.darkMode,
  () => {
    if (view) {
      // Recreate the editor with new extensions
      const newState = EditorState.create({
        doc: view.state.doc.toString(),
        extensions: getExtensions(),
      });
      view.setState(newState);
    }
  }
);

// Update the editor font size when fontSize changes
watch(
  () => props.fontSize,
  () => {
    if (view) {
      // Recreate the editor with new extensions
      const newState = EditorState.create({
        doc: view.state.doc.toString(),
        extensions: getExtensions(),
      });
      view.setState(newState);
    }
  }
);

// Get the extensions for the editor
function getExtensions(): Extension[] {
  const extensions: Extension[] = [
    // lineNumbers(),
    markdown(),
    EditorView.lineWrapping,
    // Add history support (undo/redo)
    history(),
    // Add default key bindings
    keymap.of([
      ...defaultKeymap,
      ...historyKeymap,
      indentWithTab, // Support Tab key for indentation
      // Custom key bindings
      {
        key: 'Ctrl-s',
        run: () => {
          // Trigger save event
          emit(
            'keyup',
            new KeyboardEvent('keyup', { key: 'Enter', ctrlKey: true })
          );
          return true;
        },
      },
      {
        key: 'Ctrl-/',
        run: (view) => {
          // Toggle comment (simple implementation, line comments only)
          const selection = view.state.selection.main;
          const line = view.state.doc.lineAt(selection.from);
          const isCommented = line.text.trimStart().startsWith('//');

          view.dispatch({
            changes: {
              from: line.from,
              to: line.from + (isCommented ? line.text.indexOf('//') + 2 : 0),
              insert: isCommented ? '' : '// ',
            },
          });
          return true;
        },
      },
      // Markdown-specific key bindings
      {
        key: 'Ctrl-b',
        run: (view) => {
          // Bold text
          const selection = view.state.selection.main;
          const selectedText = view.state.sliceDoc(
            selection.from,
            selection.to
          );

          view.dispatch({
            changes: {
              from: selection.from,
              to: selection.to,
              insert: `**${selectedText}**`,
            },
            selection: { anchor: selection.from + 2, head: selection.to + 2 },
          });
          return true;
        },
      },
      {
        key: 'Ctrl-i',
        run: (view) => {
          // Italic text
          const selection = view.state.selection.main;
          const selectedText = view.state.sliceDoc(
            selection.from,
            selection.to
          );

          view.dispatch({
            changes: {
              from: selection.from,
              to: selection.to,
              insert: `*${selectedText}*`,
            },
            selection: { anchor: selection.from + 1, head: selection.to + 1 },
          });
          return true;
        },
      },
      {
        key: 'Ctrl-k',
        run: (view) => {
          // Insert link
          const selection = view.state.selection.main;
          const selectedText = view.state.sliceDoc(
            selection.from,
            selection.to
          );
          const linkText = selectedText || t('editor.linkText');

          view.dispatch({
            changes: {
              from: selection.from,
              to: selection.to,
              insert: `[${linkText}](url)`,
            },
            selection: {
              anchor: selection.from + linkText.length + 3,
              head: selection.from + linkText.length + 6,
            },
          });
          return true;
        },
      },
      {
        key: 'Alt-1',
        run: (view) => {
          // Insert heading 1
          const selection = view.state.selection.main;
          const line = view.state.doc.lineAt(selection.from);
          const hasHash = line.text.trimStart().startsWith('# ');

          view.dispatch({
            changes: {
              from: line.from,
              to: line.from + (hasHash ? line.text.indexOf('# ') + 2 : 0),
              insert: hasHash ? '' : '# ',
            },
          });
          return true;
        },
      },
      {
        key: 'Alt-2',
        run: (view) => {
          // Insert heading 2
          const selection = view.state.selection.main;
          const line = view.state.doc.lineAt(selection.from);
          const hasHash = line.text.trimStart().startsWith('## ');

          view.dispatch({
            changes: {
              from: line.from,
              to: line.from + (hasHash ? line.text.indexOf('## ') + 3 : 0),
              insert: hasHash ? '' : '## ',
            },
          });
          return true;
        },
      },
      {
        key: 'Alt-l',
        run: (view) => {
          // Insert unordered list
          const selection = view.state.selection.main;
          const line = view.state.doc.lineAt(selection.from);
          const hasList = line.text.trimStart().startsWith('- ');

          view.dispatch({
            changes: {
              from: line.from,
              to: line.from + (hasList ? line.text.indexOf('- ') + 2 : 0),
              insert: hasList ? '' : '- ',
            },
          });
          return true;
        },
      },
      {
        key: 'Alt-c',
        run: (view) => {
          // Insert code block
          const selection = view.state.selection.main;
          const selectedText = view.state.sliceDoc(
            selection.from,
            selection.to
          );

          view.dispatch({
            changes: {
              from: selection.from,
              to: selection.to,
              insert: `\`\`\`\n${selectedText}\n\`\`\``,
            },
            selection: {
              anchor: selection.from + 4,
              head: selection.from + 4 + selectedText.length,
            },
          });
          return true;
        },
      },
    ]),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const newValue = update.state.doc.toString();
        emit('update:modelValue', newValue);
        emit('change', newValue);
      }
    }),
    EditorView.domEventHandlers({
      keyup: handleKeyUp,
    }),
    // Apply font size and other styling through theme
    EditorView.theme({
      '&': {
        fontSize: props.fontSize || '14px',
        height: '100%',
      },
      '.cm-scroller': {
        overflow: 'auto',
        fontFamily: 'monospace',
      },
      '.cm-content': {
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      },
      '.cm-line': {
        padding: '0 8px',
        lineHeight: '1.6',
      },
    }),
  ];

  // Add dark theme if darkMode is true
  if (props.darkMode) {
    extensions.push(oneDark);
  }

  // Add placeholder if provided
  if (props.placeholder) {
    extensions.push(placeholder(props.placeholder));
  }

  return extensions;
}
</script>

<template>
  <div class="codemirror-editor-container">
    <div
      ref="editorRef"
      class="codemirror-editor"></div>
  </div>
</template>

<style scoped>
.codemirror-editor-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.codemirror-editor {
  height: 100%;
  width: 100%;
  flex: 1;
  position: relative;
}

:deep(.cm-editor) {
  height: 100%;
  width: 100%;
  font-family: monospace;
  font-size: v-bind('props.fontSize || "14px"');
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

:deep(.cm-scroller) {
  overflow: auto;
  height: 100%;
}

:deep(.cm-content) {
  white-space: pre-wrap;
  word-break: break-word;
  min-height: 100%;
  padding: 4px 0;
}

:deep(.cm-line) {
  padding: 0 8px;
  line-height: 1.6;
}
</style>
