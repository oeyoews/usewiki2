import { ElMessage as notify, ElMessageBox } from 'element-plus';
import { t } from '@/src/i18n';

function saveMarkdown(markdown: string, title: string) {
  if (!markdown || !title) {
    notify({
      message: t('notify.contentEmpty'),
      type: 'warning',
    });
    return;
  }
  ElMessageBox.confirm(t('notify.downloadConfirm'), 'Warning', {
    confirmButtonText: t('notify.confirm'),
    cancelButtonText: t('notify.cancel'),
    title: t('notify.hint'),
    type: 'warning',
  })
    .then(() => {
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${title}.md`;

      document.body.appendChild(link);
      link.click();

      URL.revokeObjectURL(link.href);

      notify({
        message: t('notify.downloadSuccess'),
        type: 'success',
      });
    })
    .catch(() => {});
}

export default saveMarkdown;

/* function saveMarkdownFile2() {
  // Create a Blob object containing the new Markdown content
  const blob = new Blob([md.value], { type: 'text/markdown' });

  async function saveFile(blob: Blob) {
    try {
      const options = {
        suggestedName: title + '.md', // Set default file name
        types: [
          {
            description: 'Markdown file (.md)',
            accept: {
              'text/markdown': ['.md'],
            },
          },
        ],
      };
      // @ts-ignore
      const handle = await window.showSaveFilePicker(options);
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      console.log('File saved');
    } catch (err) {
      console.error('Error saving file:', err);
    }
  }

  // Call saveFile function with the Blob object
  saveFile(blob);
}
 */
