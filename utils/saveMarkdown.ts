import { ElMessage as notify } from 'element-plus';

function saveMarkdown(markdown: string, title: string) {
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${title}.md`;

  document.body.appendChild(link);
  link.click();

  URL.revokeObjectURL(link.href);

  notify({
    message: '保存成功',
    type: 'success',
  });
}

export default saveMarkdown;

/* function saveMarkdownFile2() {
  // 创建一个 Blob 对象，包含新的 Markdown 内容
  const blob = new Blob([md.value], { type: 'text/markdown' });

  async function saveFile(blob: Blob) {
    try {
      const options = {
        suggestedName: title + '.md', // 设置默认文件名
        types: [
          {
            description: 'Markdown 文件 (.md)',
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
      console.log('文件已保存');
    } catch (err) {
      console.error('保存文件时出错：', err);
    }
  }

  // 调用 saveFile 函数并传入 Blob 对象
  saveFile(blob);
}
 */
