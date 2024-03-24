declare module '*.vue' {
  const Component: import('vue').DefineComponent;
  export default Component;
}

interface IArticle {
  title: string;
  content: string;
  textContent: string;
  length: number;
  excerpt: string;
  byline: string;
  dir: string;
  siteName: string;
  lang: string;
  publishedTime: string;
}

type ITabs = 'edit' | 'preview' | 'aiedit' | 'aipreview';

interface IStatus {
  username: string;
  tiddlywiki_version: string;
}
