import rehypeSanitize from 'rehype-sanitize';
import { unified } from 'unified';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';

import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
// @ts-ignore
import remarkGfm from 'remark-gfm';
// @ts-ignore
import remarkPangu from 'remark-pangu';
// @ts-ignore
import remarkStringify from 'remark-stringify';

async function md2html(markdown: string) {
  const md2htmlParser = unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeStringify);

  return (await md2htmlParser.process(markdown)).toString();
}

async function html2md(html: string) {
  const html2mdParser = unified()
    .use(rehypeParse)
    .use(remarkGfm)
    .use(rehypeRemark)
    .use(remarkStringify)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    .use(remarkPangu);
  return (await html2mdParser.process(html)).toString();
}

export { md2html, html2md };
